import { db } from "@/lib/db";
import { listings } from "@/lib/db/schema";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CONTAINER_TYPES, CONTAINER_CONDITIONS } from "@/lib/constants/containers";
import { US_STATES } from "@/lib/constants/states";
import { SlidersHorizontal, Package } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Shipping Containers for Sale",
  description:
    "Search shipping containers for sale across the US. Filter by size, condition, type, and location. 20ft, 40ft, reefer, high cube, and more from verified sellers.",
  alternates: { canonical: "https://boxport.io/listings" },
};
import { ListingsFilter } from "@/components/listings/ListingsFilter";

interface SearchParams {
  type?: string;
  condition?: string;
  state?: string;
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
}

const PAGE_SIZE = 12;

async function getListings(params: SearchParams) {
  const page = Number(params.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;

  try {
    const conditions = [eq(listings.status, "active")];

    if (params.type) {
      conditions.push(eq(listings.containerType, params.type as any));
    }
    if (params.condition) {
      conditions.push(eq(listings.condition, params.condition as any));
    }
    if (params.state) {
      conditions.push(eq(listings.state, params.state));
    }
    if (params.min) {
      conditions.push(gte(listings.price, params.min));
    }
    if (params.max) {
      conditions.push(lte(listings.price, params.max));
    }

    const sortOrder = params.sort === "price_asc" ? asc(listings.price)
      : params.sort === "price_desc" ? desc(listings.price)
      : desc(listings.createdAt);

    const results = await db.query.listings.findMany({
      where: and(...conditions),
      with: { images: true },
      orderBy: [desc(listings.isFeatured), sortOrder],
      limit: PAGE_SIZE,
      offset,
    });

    return results;
  } catch {
    return [];
  }
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const results = await getListings(params);

  const activeFilters = [
    params.type && CONTAINER_TYPES.find((t) => t.value === params.type)?.label,
    params.condition && CONTAINER_CONDITIONS.find((c) => c.value === params.condition)?.label,
    params.state && US_STATES.find((s) => s.value === params.state)?.label,
    params.min && `From $${Number(params.min).toLocaleString()}`,
    params.max && `Up to $${Number(params.max).toLocaleString()}`,
  ].filter(Boolean) as string[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <ListingsFilter currentParams={params} />
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Shipping Containers</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {results.length} listing{results.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                className="text-sm border border-border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                defaultValue={params.sort ?? "newest"}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="text-xs">
                  {filter}
                </Badge>
              ))}
              <Link href="/listings" className="text-xs text-primary hover:underline flex items-center">
                Clear all
              </Link>
            </div>
          )}

          {/* Grid */}
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {results.map((listing) => (
                <ListingCard key={listing.id} listing={listing as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No containers found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
              <Button asChild variant="outline">
                <Link href="/listings">Clear Filters</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
