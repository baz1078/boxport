"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ExternalLink, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface StripeConnectCardProps {
  stripeAccountStatus?: string | null;
  stripeAccountId?: string | null;
}

export function StripeConnectCard({ stripeAccountStatus, stripeAccountId }: StripeConnectCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isActive = stripeAccountStatus === "active";
  const isPending = stripeAccountId && stripeAccountStatus !== "active";

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/connect/onboard", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Could not connect to Stripe. Try again.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/connect/dashboard");
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      toast.error("Could not open Stripe dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payout Settings
          </CardTitle>
          {isActive && (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
          {isPending && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Pending Verification
            </Badge>
          )}
        </div>
        <CardDescription>
          Connect Stripe to receive payments from container sales.
          BoxPort uses Stripe Connect to securely transfer your earnings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isActive ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your Stripe account is connected. You&apos;ll receive payouts automatically after buyers confirm receipt.
            </p>
            <Button variant="outline" onClick={handleDashboard} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
              View Stripe Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {isPending
                ? "Complete your Stripe verification to start receiving payments."
                : "Set up your payout account to receive money from sales. Takes about 2 minutes."}
            </p>
            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Connecting...</>
              ) : (
                <><CreditCard className="h-4 w-4 mr-2" /> {isPending ? "Complete Verification" : "Connect Stripe"}</>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
