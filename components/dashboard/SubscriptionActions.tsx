"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionActionsProps {
  isPro: boolean;
  isCancelling: boolean;
}

export function SubscriptionActions({ isPro, isCancelling }: SubscriptionActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/subscription", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to start upgrade");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your Pro subscription?")) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/subscription", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to cancel");
        return;
      }
      toast.success("Subscription will cancel at end of billing period.");
      window.location.reload();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPro) {
    if (isCancelling) {
      return (
        <p className="text-sm text-muted-foreground">
          Your subscription is set to cancel. You&apos;ll keep Pro access until the end of your billing period.
        </p>
      );
    }
    return (
      <Button
        variant="outline"
        className="w-full border-destructive text-destructive hover:bg-destructive/5"
        onClick={handleCancel}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Cancel Subscription
      </Button>
    );
  }

  return (
    <Button
      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
      onClick={handleUpgrade}
      disabled={isLoading}
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Zap className="mr-2 h-4 w-4" />
      )}
      Upgrade to Pro
    </Button>
  );
}
