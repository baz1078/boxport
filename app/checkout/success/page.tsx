import Link from "next/link";
import { CheckCircle, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmReceiptButton } from "@/components/checkout/ConfirmReceiptButton";

export const metadata = { title: "Payment Successful — BoxPort" };

interface PageProps {
  searchParams: Promise<{ payment_intent?: string; transaction_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const transactionId = params.transaction_id;

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-border p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2">Payment Received!</h1>
          <p className="text-muted-foreground">
            Your funds are securely held in escrow. The seller has been notified
            and will coordinate delivery.
          </p>
        </div>

        {/* Escrow Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-left space-y-3">
          <h2 className="font-semibold text-blue-900 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Your funds are protected
          </h2>
          <ul className="text-sm text-blue-800 space-y-1.5 list-disc list-inside">
            <li>Seller receives payment only after you confirm delivery</li>
            <li>Funds auto-release after 7 days if no dispute filed</li>
            <li>Contact support if there&apos;s any issue with your container</li>
          </ul>
        </div>

        {/* Confirm Receipt */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-left space-y-3">
          <h2 className="font-semibold text-amber-900 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            When you receive your container
          </h2>
          <p className="text-sm text-amber-800">
            Once you&apos;ve inspected and accepted delivery, click below to release
            payment to the seller.
          </p>
          {transactionId ? (
            <ConfirmReceiptButton transactionId={transactionId} />
          ) : (
            <p className="text-xs text-amber-700">
              You&apos;ll receive an email with your confirmation link. Funds
              auto-release after 7 days.
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/listings">Browse More</Link>
          </Button>
          <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
