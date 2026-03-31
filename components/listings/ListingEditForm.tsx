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
import { Loader2, Save, Trash2, Eye, Pause, Play } from "lucide-react";
import { formatCurrency } from "@/lib/utils/fees";
import Link from "next/link";

const editSchema = z.object({
  title: z.string().min(5).max(100),
  price: z.string().min(1),
  description: z.string().optional(),
  conditionNotes: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  zip: z.string().min(5),
});

type EditFormData = z.infer<typeof editSchema>;

interface ListingEditFormProps {
  listing: {
    id: string;
    title: string;
    price: string;
    description: string | null;
    conditionNotes: string | null;
    city: string;
    state: string;
    zip: string;
    status: string;
    slug: string;
    allowOffers: boolean;
    buyNowEnabled: boolean;
  };
}

export function ListingEditForm({ listing }: ListingEditFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: listing.title,
      price: Number(listing.price).toString(),
      description: listing.description ?? "",
      conditionNotes: listing.conditionNotes ?? "",
      city: listing.city,
      state: listing.state,
      zip: listing.zip,
    },
  });

  const onSubmit = async (data: EditFormData) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          price: Number(data.price),
          description: data.description,
          conditionNotes: data.conditionNotes,
          city: data.city,
          state: data.state,
          zip: data.zip,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to save changes");
        return;
      }

      toast.success("Listing updated!");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = listing.status === "active" ? "paused" : "active";
    setIsStatusChanging(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        toast.error("Failed to update status");
        return;
      }
      toast.success(newStatus === "paused" ? "Listing paused" : "Listing reactivated");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsStatusChanging(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, { method: "DELETE" });
      if (!res.ok) {
        const result = await res.json();
        toast.error(result.error || "Failed to delete listing");
        return;
      }
      toast.success("Listing deleted.");
      router.push("/dashboard/listings");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsDeleting(false);
    }
  };

  const canToggleStatus = listing.status === "active" || listing.status === "paused";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          asChild
          variant="outline"
          size="sm"
          type="button"
        >
          <Link href={`/listings/${listing.slug}`} target="_blank">
            <Eye className="h-3.5 w-3.5 mr-1" />
            View Live
          </Link>
        </Button>

        {canToggleStatus && (
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleStatusToggle}
            disabled={isStatusChanging}
          >
            {isStatusChanging ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : listing.status === "active" ? (
              <Pause className="h-3.5 w-3.5 mr-1" />
            ) : (
              <Play className="h-3.5 w-3.5 mr-1" />
            )}
            {listing.status === "active" ? "Pause Listing" : "Reactivate"}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          type="button"
          className="border-destructive text-destructive hover:bg-destructive/5 ml-auto"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
          Delete
        </Button>
      </div>

      {/* Core Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listing Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price">Price (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                id="price"
                type="number"
                className={`pl-7 ${errors.price ? "border-destructive" : ""}`}
                {...register("price")}
              />
            </div>
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe your container..."
              {...register("description")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="conditionNotes">Condition Notes</Label>
            <Textarea
              id="conditionNotes"
              rows={2}
              placeholder="Any specific condition details..."
              {...register("conditionNotes")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="col-span-3 sm:col-span-1 space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} className={errors.city ? "border-destructive" : ""} />
            {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register("state")} className={errors.state ? "border-destructive" : ""} />
            {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zip">ZIP</Label>
            <Input id="zip" {...register("zip")} className={errors.zip ? "border-destructive" : ""} />
            {errors.zip && <p className="text-xs text-destructive">{errors.zip.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving || !isDirty}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
