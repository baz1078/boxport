import Link from "next/link";
import Image from "next/image";
import { MapPin, Eye, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConditionBadge } from "./ConditionBadge";
import { formatCurrency } from "@/lib/utils/fees";
import { CONTAINER_TYPE_LABELS } from "@/lib/constants/containers";
import type { Listing, ListingImage } from "@/lib/db/schema";

interface ListingCardProps {
  listing: Listing & { images: ListingImage[]; sellerName?: string | null };
}

export function ListingCard({ listing }: ListingCardProps) {
  const primaryImage = listing.images?.find((img) => img.isPrimary) ?? listing.images?.[0];

  return (
    <Link href={`/listings/${listing.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="text-muted-foreground text-4xl">📦</div>
            </div>
          )}
          {listing.isFeatured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-accent text-accent-foreground text-xs font-semibold">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}
          {listing.status === "pending" && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm font-semibold">Sale Pending</Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Price */}
          <div className="flex items-start justify-between mb-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(Number(listing.price))}
            </span>
            <ConditionBadge condition={listing.condition} />
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>

          {/* Type */}
          <p className="text-xs text-muted-foreground mb-3">
            {CONTAINER_TYPE_LABELS[listing.containerType] ?? listing.containerType}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {listing.city}, {listing.state}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {listing.viewCount}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
