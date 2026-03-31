"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Loader2, CheckCircle } from "lucide-react";

const offerSchema = z.object({
  buyerName: z.string().min(2, "Name is required"),
  buyerEmail: z.string().email("Valid email required"),
  buyerPhone: z.string().optional(),
  amount: z.string().min(1, "Offer amount is required").refine(
    (v) => !isNaN(Number(v)) && Number(v) > 0,
    "Enter a valid amount"
  ),
  message: z.string().max(500).optional(),
});

type OfferFormData = z.infer<typeof offerSchema>;

interface OfferFormProps {
  listingId: string;
  askingPrice: number;
  listingTitle: string;
}

export function OfferForm({ listingId, askingPrice, listingTitle }: OfferFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OfferFormData>({ resolver: zodResolver(offerSchema) });

  const onSubmit = async (data: OfferFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          buyerName: data.buyerName,
          buyerEmail: data.buyerEmail,
          buyerPhone: data.buyerPhone,
          amount: Number(data.amount),
          message: data.message,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to submit offer");
        return;
      }

      setSubmitted(true);
      reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5" size="lg" />}>
        <MessageSquare className="mr-2 h-4 w-4" />
        Make an Offer
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Asking price: <strong>${askingPrice.toLocaleString()}</strong>
          </p>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
            <h3 className="font-semibold text-lg">Offer Submitted!</h3>
            <p className="text-sm text-muted-foreground">
              The seller has been notified. You&apos;ll receive an email when they respond.
              Offers expire after 48 hours.
            </p>
            <Button onClick={() => { setIsOpen(false); setSubmitted(false); }} className="mt-2">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="offer-amount">Your Offer (USD) <span className="text-destructive">*</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  id="offer-amount"
                  type="number"
                  placeholder={Math.round(askingPrice * 0.9).toString()}
                  className={`pl-7 ${errors.amount ? "border-destructive" : ""}`}
                  {...register("amount")}
                />
              </div>
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="buyer-name">Your Name <span className="text-destructive">*</span></Label>
              <Input
                id="buyer-name"
                placeholder="John Smith"
                {...register("buyerName")}
                className={errors.buyerName ? "border-destructive" : ""}
              />
              {errors.buyerName && <p className="text-xs text-destructive">{errors.buyerName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="buyer-email">Email Address <span className="text-destructive">*</span></Label>
              <Input
                id="buyer-email"
                type="email"
                placeholder="john@example.com"
                {...register("buyerEmail")}
                className={errors.buyerEmail ? "border-destructive" : ""}
              />
              {errors.buyerEmail && <p className="text-xs text-destructive">{errors.buyerEmail.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="buyer-phone">Phone (optional)</Label>
              <Input
                id="buyer-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                {...register("buyerPhone")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="offer-message">Message to Seller (optional)</Label>
              <Textarea
                id="offer-message"
                placeholder="Any questions or notes for the seller..."
                rows={3}
                {...register("message")}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              By submitting, you agree to BoxPort&apos;s terms. The seller has 48 hours to respond.
            </p>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Offer"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
