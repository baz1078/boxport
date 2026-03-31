"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CONTAINER_TYPES, CONTAINER_CONDITIONS } from "@/lib/constants/containers";
import { US_STATES } from "@/lib/constants/states";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { Loader2, Info } from "lucide-react";

const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  containerType: z.string().min(1, "Please select a container type"),
  condition: z.string().min(1, "Please select a condition"),
  price: z.string().min(1, "Price is required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Price must be greater than 0"),
  allowOffers: z.boolean(),
  buyNowEnabled: z.boolean(),
  description: z.string().max(2000).optional(),
  conditionNotes: z.string().max(500).optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().regex(/^\d{5}$/, "Enter a valid 5-digit ZIP code"),
  yearManufactured: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface ListingFormProps {
  sellerId: string;
  initialData?: Partial<ListingFormData & { id: string; images: { url: string; key: string; isPrimary: boolean }[] }>;
  mode?: "create" | "edit";
}

export function ListingForm({ sellerId, initialData, mode = "create" }: ListingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ url: string; key: string }[]>(
    initialData?.images?.map((img) => ({ url: img.url, key: img.key })) ?? []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      allowOffers: initialData?.allowOffers ?? true,
      buyNowEnabled: initialData?.buyNowEnabled ?? true,
      containerType: initialData?.containerType ?? "",
      condition: initialData?.condition ?? "",
      state: initialData?.state ?? "",
      ...initialData,
    },
  });

  const onSubmit = async (data: ListingFormData) => {
    if (uploadedImages.length === 0) {
      toast.error("Please upload at least one photo");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = mode === "edit" ? `/api/listings/${initialData?.id}` : "/api/listings";
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          price: Number(data.price),
          yearManufactured: data.yearManufactured ? Number(data.yearManufactured) : undefined,
          images: uploadedImages,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to save listing");
        return;
      }

      toast.success(mode === "edit" ? "Listing updated!" : "Listing created and published!");
      router.push("/dashboard/listings");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photos <span className="text-destructive">*</span></CardTitle>
          <p className="text-sm text-muted-foreground">Upload up to 10 photos. The first photo will be the cover image.</p>
        </CardHeader>
        <CardContent>
          <ImageUploader
            images={uploadedImages}
            onImagesChange={setUploadedImages}
            maxImages={10}
          />
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Container Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Listing Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="e.g. 40ft High Cube One-Trip Container — Houston TX"
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Container Type <span className="text-destructive">*</span></Label>
              <select
                {...register("containerType")}
                className={`w-full text-sm border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring ${errors.containerType ? "border-destructive" : "border-border"}`}
              >
                <option value="">Select type...</option>
                {CONTAINER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.containerType && <p className="text-xs text-destructive">{errors.containerType.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Condition <span className="text-destructive">*</span></Label>
              <select
                {...register("condition")}
                className={`w-full text-sm border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring ${errors.condition ? "border-destructive" : "border-border"}`}
              >
                <option value="">Select condition...</option>
                {CONTAINER_CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.condition && <p className="text-xs text-destructive">{errors.condition.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="conditionNotes">Condition Notes</Label>
            <Textarea
              id="conditionNotes"
              placeholder="Describe any dents, rust, repairs, or notable details about the container's condition..."
              rows={3}
              {...register("conditionNotes")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="yearManufactured">Year Manufactured</Label>
            <Input
              id="yearManufactured"
              type="number"
              placeholder="e.g. 2019"
              {...register("yearManufactured")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              placeholder="Provide any additional details: history, modifications, accessories included, pickup instructions..."
              rows={5}
              {...register("description")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pricing & Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="price">Asking Price (USD) <span className="text-destructive">*</span></Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                id="price"
                type="number"
                placeholder="0"
                className={`pl-7 ${errors.price ? "border-destructive" : ""}`}
                {...register("price")}
              />
            </div>
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              A 4.9% platform fee will be deducted from your payout at time of sale.
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="allowOffers"
                checked={watch("allowOffers")}
                onCheckedChange={(checked) => setValue("allowOffers", !!checked)}
              />
              <div>
                <Label htmlFor="allowOffers" className="cursor-pointer font-medium">Allow offers</Label>
                <p className="text-xs text-muted-foreground">Buyers can submit offers below asking price</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="buyNowEnabled"
                checked={watch("buyNowEnabled")}
                onCheckedChange={(checked) => setValue("buyNowEnabled", !!checked)}
              />
              <div>
                <Label htmlFor="buyNowEnabled" className="cursor-pointer font-medium">Enable Buy Now</Label>
                <p className="text-xs text-muted-foreground">Buyers can purchase immediately at asking price</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Container Location</CardTitle>
          <p className="text-sm text-muted-foreground">Where is the container currently located? (Pickup address)</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
              <Input
                id="city"
                placeholder="Houston"
                {...register("city")}
                className={errors.city ? "border-destructive" : ""}
              />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>State <span className="text-destructive">*</span></Label>
              <select
                {...register("state")}
                className={`w-full text-sm border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring ${errors.state ? "border-destructive" : "border-border"}`}
              >
                <option value="">Select state...</option>
                {US_STATES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zip">ZIP Code <span className="text-destructive">*</span></Label>
            <Input
              id="zip"
              placeholder="77001"
              maxLength={5}
              {...register("zip")}
              className={`max-w-40 ${errors.zip ? "border-destructive" : ""}`}
            />
            {errors.zip && <p className="text-xs text-destructive">{errors.zip.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-3 pb-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
          disabled={isLoading}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {mode === "edit" ? "Saving..." : "Publishing..."}</>
          ) : (
            mode === "edit" ? "Save Changes" : "Publish Listing"
          )}
        </Button>
      </div>
    </form>
  );
}
