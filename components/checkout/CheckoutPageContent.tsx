"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/fees";
import { toast } from "sonner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutData {
  clientSecret: string;
  amount: number;
  platformFee: number;
  sellerPayout: number;
}

export function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Invalid checkout link. This link may have expired.");
      setLoading(false);
      return;
    }

    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setCheckoutData(data);
        }
      })
      .catch(() => setError("Failed to initialize checkout. Please try again."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Preparing your checkout…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-border p-8 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Checkout Unavailable</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  if (!checkoutData) return null;

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-5">
          <h1 className="text-xl font-bold text-white">Complete Your Purchase</h1>
          <p className="text-primary-foreground/70 text-sm mt-0.5">
            Secured by BoxPort Escrow
          </p>
        </div>

        {/* Order Summary */}
        <div className="px-6 py-5 border-b border-border space-y-2">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Order Summary
          </h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Container Price</span>
            <span className="font-medium">{formatCurrency(checkoutData.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform Fee (4.9%)</span>
            <span className="font-medium">{formatCurrency(checkoutData.platformFee)}</span>
          </div>
          <div className="border-t border-border mt-2 pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-lg">{formatCurrency(checkoutData.amount)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Funds are held in escrow until you confirm receipt.
          </p>
        </div>

        {/* Payment Form */}
        <div className="px-6 py-5">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: checkoutData.clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#1E3A5F",
                  borderRadius: "8px",
                },
              },
            }}
          >
            <PaymentForm amount={checkoutData.amount} />
          </Elements>
        </div>

        {/* Trust Footer */}
        <div className="px-6 pb-5 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>
            Your payment is held securely. Funds release to the seller only after
            you confirm receipt of your container.
          </span>
        </div>
      </div>
    </div>
  );
}

function PaymentForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Payment failed. Please try again.");
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === "requires_capture") {
      // Funds are held — payment succeeded, awaiting capture
      router.push("/checkout/success");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          `Pay ${formatCurrency(amount)} — Hold in Escrow`
        )}
      </Button>
    </form>
  );
}
