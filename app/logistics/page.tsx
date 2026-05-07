import { db } from "@/lib/db";
import { carriers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Phone, Globe, MapPin, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Container Delivery Carriers — BoxPort Logistics",
  description:
    "Find verified container haulers and delivery carriers across the US. BoxPort connects container buyers with trusted logistics providers.",
  alternates: { canonical: "https://boxport.io/logistics" },
};

const EQUIPMENT_LABELS: Record<string, string> = {
  flatbed: "Flatbed Truck",
  tilt_bed: "Tilt-Bed / Roll-Off",
  crane_truck: "Crane Truck",
  lowboy: "Lowboy Trailer",
  forklift: "Forklift / Reach Stacker",
};

async function getCarriers() {
  try {
    return await db.query.carriers.findMany({
      where: eq(carriers.isActive, true),
      orderBy: (c, { desc }) => [desc(c.isVerified), desc(c.createdAt)],
    });
  } catch {
    return [];
  }
}

export default async function LogisticsPage() {
  const carrierList = await getCarriers();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold">Container Delivery Carriers</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Verified haulers who specialize in container delivery across the US. Contact them
            directly to get a quote for your delivery.
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
          <Link href="/logistics/join">
            Are you a carrier? Join free <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {carrierList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {carrierList.map((carrier) => {
            const states = carrier.serviceAreas.split(",").map((s) => s.trim());
            const equipment = carrier.equipmentTypes.split(",").map((e) => EQUIPMENT_LABELS[e.trim()] ?? e.trim());

            return (
              <Card key={carrier.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-4">
                  {/* Name + verified */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base">{carrier.businessName}</h3>
                      <p className="text-sm text-muted-foreground">{carrier.contactName}</p>
                    </div>
                    {carrier.isVerified && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs flex items-center gap-1 shrink-0">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </Badge>
                    )}
                  </div>

                  {/* Bio */}
                  {carrier.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{carrier.bio}</p>
                  )}

                  {/* Equipment */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Equipment</p>
                    <div className="flex flex-wrap gap-1.5">
                      {equipment.map((e) => (
                        <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* States */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      Serves {states.length} state{states.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{states.join(", ")}</p>
                  </div>

                  {/* Contact */}
                  <div className="flex flex-col gap-2 pt-1 border-t border-border">
                    <a
                      href={`tel:${carrier.phone}`}
                      className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {carrier.phone}
                    </a>
                    {carrier.website && (
                      <a
                        href={carrier.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Visit website
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Carriers coming soon</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            We're onboarding verified container haulers. Are you a carrier? Be one of the first listed.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/logistics/join">Join as a Carrier</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
