import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { listings, userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AdminListingForm } from "@/components/admin/AdminListingForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Edit Listing — Admin" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditListingPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/dashboard");

  const { id } = await params;

  const listing = await db.query.listings.findFirst({
    where: eq(listings.id, id),
    with: { images: true },
  });

  if (!listing) notFound();

  const sellers = await db.query.userProfiles.findMany({
    orderBy: (up, { asc }) => [asc(up.fullName)],
  });

  const initialData = {
    id: listing.id,
    sellerId: listing.sellerId,
    title: listing.title,
    listingType: listing.listingType as "sale" | "rent_to_own",
    containerType: listing.containerType,
    condition: listing.condition,
    price: listing.price,
    allowOffers: listing.allowOffers,
    buyNowEnabled: listing.buyNowEnabled,
    description: listing.description ?? "",
    conditionNotes: listing.conditionNotes ?? "",
    city: listing.city,
    state: listing.state,
    zip: listing.zip,
    yearManufactured: listing.yearManufactured?.toString() ?? "",
    rtoMonthlyPayment: listing.rtoMonthlyPayment ?? "",
    rtoTermMonths: listing.rtoTermMonths?.toString() ?? "",
    rtoDownPayment: listing.rtoDownPayment ?? "",
    status: listing.status,
    images: listing.images.map((img) => ({
      url: img.url,
      key: img.key,
      isPrimary: img.isPrimary,
    })),
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/listings"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Listings
        </Link>
        <h1 className="text-2xl font-bold">Edit Listing</h1>
        <p className="text-muted-foreground text-sm mt-1 truncate">{listing.title}</p>
      </div>

      <AdminListingForm sellers={sellers} initialData={initialData} mode="edit" />
    </div>
  );
}
