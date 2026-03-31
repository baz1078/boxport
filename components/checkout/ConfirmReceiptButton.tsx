"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ConfirmReceiptButtonProps {
  transactionId: string;
}

export function ConfirmReceiptButton({ transactionId }: ConfirmReceiptButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to confirm receipt");
        return;
      }

      setConfirmed(true);
      toast.success("Receipt confirmed! Payment released to seller.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm">
        <CheckCircle className="h-4 w-4" />
        Payment released to seller. Thank you!
      </div>
    );
  }

  return (
    <Button
      onClick={handleConfirm}
      disabled={isLoading}
      className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Confirming…
        </>
      ) : (
        "Confirm Receipt & Release Payment"
      )}
    </Button>
  );
}
