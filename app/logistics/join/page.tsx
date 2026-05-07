import { CarrierForm } from "@/components/logistics/CarrierForm";
import { Badge } from "@/components/ui/badge";
import { Check, Truck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join BoxPort Logistics — Get Container Delivery Jobs",
  description:
    "Are you a trucking company or container hauler? Join BoxPort Logistics to connect with buyers who need container delivery across the US.",
  alternates: { canonical: "https://boxport.io/logistics/join" },
};

const BENEFITS = [
  "Get matched with buyers who need delivery in your area",
  "Free to join — no upfront cost to list your service",
  "Verified badge displayed on your profile",
  "Direct contact from buyers — no middleman",
];

export default function JoinLogisticsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: pitch */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <Badge className="bg-accent/10 text-accent border-accent/20 mb-4">For Carriers</Badge>
            <h1 className="text-3xl font-bold leading-tight">Deliver containers. Grow your business.</h1>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              BoxPort connects container buyers with trusted haulers. When a buyer needs delivery,
              your business shows up first — in their state, for their equipment needs.
            </p>
          </div>

          <div className="space-y-3">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{b}</p>
              </div>
            ))}
          </div>

          <div className="bg-muted/40 rounded-xl p-4 flex items-start gap-3">
            <Truck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              We review all applications before listing. Having a USDOT number and insurance on file
              helps speed up verification.
            </p>
          </div>
        </div>

        {/* Right: form */}
        <div className="lg:col-span-2">
          <CarrierForm />
        </div>
      </div>
    </div>
  );
}
