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
import { Loader2, User } from "lucide-react";

const listingSchema = z.object({
  sellerId: z.string().min(1, "Please select a seller"),
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

type FormData = z.infer<typeof listingSchema>;

interface Seller {
  id: string;
  fullName: string;
  businessName: string | null;
  email: string | null;
}

export function AdminListingForm({ sellers }: { sellers: Seller[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ url: string; key: string }[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      allowOffers: true,
      buyNowEnabled: true,
      sellerId: "",
      containerType: "",
      condition: "",
      state: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (uploadedImages.length === 0) {
      toast.error("Please upload at least one photo");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "POST",
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
        toast.error(result.error || "Failed to create listing");
        return;
      }

      toast.success("Listing created and published for seller!");
      router.push("/admin/listings");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Seller Selector */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Select Seller <span className="text-destructive">*</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">Choose which seller account this listing will be posted under.</p>
        </CardHeader>
        <CardContent>
          <select
            {...register("sellerId")}
            className={`w-full text-sm border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring ${errors.sellerId ? "border-destructive" : "border-border"}`}
          >
            <option value="">Select a seller...</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName || "No name"}{s.businessName ? ` — ${s.businessName}` : ""} ({s.email})
              </option>
            ))}
          </select>
          {errors.sellerId && <p className="text-xs text-destructive mt-1">{errors.sellerId.message}</p>}
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photos <span className="text-destructive">*</span></CardTitle>
          <p className="text-sm text-muted-foreground">Upload up to 10 photos. First photo is the cover image.</p>
        </CardHeader>
        <CardContent>
          <ImageUploader images={uploadedImages} onImagesChange={setUploadedImages} maxImages={10} />
        </CardContent>
      </Card>

      {/* Container Details */}
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
              placeholder="Any dents, rust, repairs, or notable details..."
              rows={3}
              {...register("conditionNotes")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="yearManufactured">Year Manufactured</Label>
            <Input id="yearManufactured" type="number" placeholder="e.g. 2019" {...register("yearManufactured")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              placeholder="History, modifications, accessories, pickup instructions..."
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
          <p className="text-sm text-muted-foreground">Where is the container currently located?</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
              <Input id="city" placeholder="Houston" {...register("city")} className={errors.city ? "border-destructive" : ""} />
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
            <Input id="zip" placeholder="77001" maxLength={5} {...register("zip")} className={`max-w-40 ${errors.zip ? "border-destructive" : ""}`} />
            {errors.zip && <p className="text-xs text-destructive">{errors.zip.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-3 pb-8">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-semibold px-8" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</>
          ) : (
            "Publish Listing for Seller"
          )}
        </Button>
      </div>
    </form>
  );
}
