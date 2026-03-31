"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function MarkAllReadButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleMarkAllRead = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (!res.ok) {
        toast.error("Failed to mark notifications as read");
        return;
      }
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
      ) : (
        <CheckCircle className="h-3.5 w-3.5 mr-1" />
      )}
      Mark all read
    </Button>
  );
}
