"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, MessageSquare, Loader2 } from "lucide-react";

interface OfferActionsProps {
  offerId: string;
  listingId: string;
  currentAmount: number;
}

export function OfferActions({ offerId, listingId, currentAmount }: OfferActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<"accept" | "decline" | "counter" | null>(null);
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterAmount, setCounterAmount] = useState("");
  const [counterMessage, setCounterMessage] = useState("");

  const handleAction = async (action: "accept" | "decline") => {
    setIsLoading(action);
    try {
      const res = await fetch(`/api/offers/${offerId}/${action}`, { method: "POST" });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || `Failed to ${action} offer`);
        return;
      }

      toast.success(action === "accept" ? "Offer accepted! Buyer has been notified." : "Offer declined.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleCounter = async () => {
    if (!counterAmount || isNaN(Number(counterAmount)) || Number(counterAmount) <= 0) {
      toast.error("Enter a valid counter amount");
      return;
    }

    setIsLoading("counter");
    try {
      const res = await fetch(`/api/offers/${offerId}/counter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(counterAmount), message: counterMessage }),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to send counter");
        return;
      }

      toast.success("Counter-offer sent to buyer.");
      setCounterOpen(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 flex-shrink-0">
      <Button
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
        onClick={() => handleAction("accept")}
        disabled={!!isLoading}
      >
        {isLoading === "accept" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1" />}
        Accept
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="border-primary text-primary hover:bg-primary/5"
        onClick={() => setCounterOpen(true)}
        disabled={!!isLoading}
      >
        <MessageSquare className="h-3.5 w-3.5 mr-1" />
        Counter
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="border-destructive text-destructive hover:bg-destructive/5"
        onClick={() => handleAction("decline")}
        disabled={!!isLoading}
      >
        {isLoading === "decline" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5 mr-1" />}
        Decline
      </Button>

      {/* Counter Modal */}
      <Dialog open={counterOpen} onOpenChange={setCounterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Counter-Offer</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Buyer offered <strong>${currentAmount.toLocaleString()}</strong>. Enter your counter price.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Your Counter Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  placeholder="0"
                  className="pl-7"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Message (optional)</Label>
              <Textarea
                placeholder="Add context for your counter..."
                rows={3}
                value={counterMessage}
                onChange={(e) => setCounterMessage(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setCounterOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleCounter} disabled={isLoading === "counter"}>
                {isLoading === "counter" ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...</> : "Send Counter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
