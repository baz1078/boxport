import { Suspense } from "react";
import { CheckoutPageContent } from "@/components/checkout/CheckoutPageContent";

export const metadata = { title: "Checkout — BoxPort" };

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-12">
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutPageContent />
      </Suspense>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-border p-8 animate-pulse space-y-6">
      <div className="h-8 bg-muted rounded w-2/3" />
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="h-40 bg-muted rounded" />
      <div className="h-12 bg-muted rounded" />
    </div>
  );
}
