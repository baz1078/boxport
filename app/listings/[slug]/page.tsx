import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { listings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConditionBadge } from "@/components/listings/ConditionBadge";
import { OfferForm } from "@/components/offers/OfferForm";
import { CONTAINER_TYPE_LABELS } from "@/lib/constants/containers";
import { formatCurrency } from "@/lib/utils/fees";
import { formatDate } from "@/lib/utils/formatters";
import { MapPin, Eye, Calendar, Package, Star, MessageSquare, ShieldCheck } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await db.query.listings.findFirst({
    where: eq(listings.slug, slug),
  });
  if (!listing) return { title: "Listing Not Found" };
  const price = Number(listing.price).toLocaleString();
  const typeLabel = CONTAINER_TYPE_LABELS[listing.containerType];
  const description = `${typeLabel} for sale in ${listing.city}, ${listing.state} — $${price}. ${listing.description?.slice(0, 120) ?? ""}`;
  return {
    title: `${listing.title} — ${listing.city}, ${listing.state}`,
    description,
    alternates: { canonical: `https://boxport.io/listings/${slug}` },
    openGraph: {
      title: listing.title,
      description,
      url: `https://boxport.io/listings/${slug}`,
      images: listing.images?.[0] ? [{ url: listing.images[0].url }] : [],
      type: "website",
    },
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const listing = await db.query.listings.findFirst({
    where: eq(listings.slug, slug),
    with: {
      images: { orderBy: (img, { asc }) => [asc(img.position)] },
    },
  });

  if (!listing || listing.status === "draft") notFound();

  // Increment view count (fire and forget)
  db.update(listings)
    .set({ viewCount: listing.viewCount + 1 })
    .where(eq(listings.id, listing.id))
    .catch(() => {});

  const seller = await db.query.userProfiles.findFirst({
    where: (p, { eq: peq }) => peq(p.id, listing.sellerId),
  });

  const primaryImage = listing.images.find((i) => i.isPrimary) ?? listing.images[0];

  const specs = [
    { label: "Container Type", value: CONTAINER_TYPE_LABELS[listing.containerType] },
    { label: "Size", value: listing.containerType.includes("40") ? "40ft" : listing.containerType.includes("20") ? "20ft" : "Varies" },
    { label: "Year Manufactured", value: listing.yearManufactured?.toString() ?? "Not specified" },
    { label: "Location", value: `${listing.city}, ${listing.state} ${listing.zip}` },
    { label: "Listed", value: formatDate(listing.createdAt) },
  ].filter((s) => s.value && s.value !== "Not specified");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description ?? undefined,
    image: listing.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: Number(listing.price).toFixed(2),
      availability: listing.status === "active"
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
      url: `https://boxport.io/listings/${listing.slug}`,
      seller: {
        "@type": "Organization",
        name: "BoxPort",
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images + Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground flex items-center gap-2">
            <Link href="/listings" className="hover:text-foreground transition-colors">Containers</Link>
            <span>/</span>
            <span className="text-foreground">{listing.title}</span>
          </nav>

          {/* Image Gallery */}
          <div className="space-y-3">
            {/* Primary Image */}
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-muted">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
              )}
              {listing.isFeatured && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-accent text-accent-foreground font-semibold">
                    <Star className="w-3 h-3 mr-1" /> Featured
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnail Grid */}
            {listing.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {listing.images.slice(0, 5).map((img, index) => (
                  <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted border-2 border-transparent hover:border-primary transition-colors cursor-pointer">
                    <Image
                      src={img.url}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                    {index === 4 && listing.images.length > 5 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-semibold">
                        +{listing.images.length - 5}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title & Status */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              {listing.status === "pending" && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex-shrink-0">Sale Pending</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <ConditionBadge condition={listing.condition} />
              <span className="text-muted-foreground text-sm flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {listing.city}, {listing.state}
              </span>
              <span className="text-muted-foreground text-sm flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> {listing.viewCount} views
              </span>
              <span className="text-muted-foreground text-sm flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {formatDate(listing.createdAt)}
              </span>
            </div>
          </div>

          {/* Specs */}
          <div className="bg-muted/40 rounded-xl p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" /> Container Specifications
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {specs.map((spec) => (
                <div key={spec.label}>
                  <p className="text-xs text-muted-foreground">{spec.label}</p>
                  <p className="text-sm font-medium">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h2 className="font-semibold mb-3">Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}

          {/* Condition Notes */}
          {listing.conditionNotes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">Condition Notes from Seller</h3>
              <p className="text-sm text-yellow-700">{listing.conditionNotes}</p>
            </div>
          )}

          {/* Trust */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-4">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            All transactions are protected by BoxPort escrow. Funds are held until you confirm receipt.
          </div>
        </div>

        {/* Right: Price + Actions + Offer Form */}
        <div className="space-y-5">
          {/* Price Card */}
          <div className="border border-border rounded-xl p-5 space-y-4 sticky top-24">
            <div>
              <p className="text-3xl font-bold">{formatCurrency(Number(listing.price))}</p>
              <p className="text-xs text-muted-foreground mt-1">+ applicable taxes and transport fees</p>
            </div>

            <Separator />

            {/* Seller Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {seller?.fullName?.[0] ?? "?"}
              </div>
              <div>
                <p className="text-sm font-medium">{seller?.businessName || seller?.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {seller?.city && seller?.state ? `${seller.city}, ${seller.state}` : "Seller"}
                </p>
              </div>
            </div>

            <Separator />

            {listing.status === "active" ? (
              <div className="space-y-3">
                {listing.buyNowEnabled && (
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold" size="lg">
                    Buy Now — {formatCurrency(Number(listing.price))}
                  </Button>
                )}

                {listing.allowOffers && (
                  <OfferForm
                    listingId={listing.id}
                    askingPrice={Number(listing.price)}
                    listingTitle={listing.title}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Badge variant="secondary" className="text-sm">This listing is no longer available</Badge>
              </div>
            )}

            {/* Contact note */}
            <p className="text-xs text-center text-muted-foreground">
              <MessageSquare className="h-3 w-3 inline mr-1" />
              Response typically within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
