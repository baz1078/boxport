import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { listings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { ListingEditForm } from "@/components/listings/ListingEditForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const listing = await db.query.listings.findFirst({
    where: eq(listings.id, id),
    columns: { title: true },
  });
  return { title: listing ? `Edit: ${listing.title}` : "Edit Listing" };
}

export default async function EditListingPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { id } = await params;

  const listing = await db.query.listings.findFirst({
    where: and(eq(listings.id, id), eq(listings.sellerId, session.user.id)),
    with: { images: true },
  });

  if (!listing) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Listing</h1>
        <p className="text-sm text-muted-foreground mt-1">{listing.title}</p>
      </div>
      <ListingEditForm listing={listing} />
    </div>
  );
}
