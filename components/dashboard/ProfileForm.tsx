"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { US_STATES } from "@/lib/constants/states";
import { Loader2 } from "lucide-react";
import type { UserProfile } from "@/lib/db/schema";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  businessName: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().regex(/^\d{5}$/, "Enter a valid 5-digit ZIP").optional().or(z.literal("")),
  bio: z.string().max(500).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: UserProfile | undefined;
  userId: string;
}

export function ProfileForm({ profile, userId }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.fullName ?? "",
      businessName: profile?.businessName ?? "",
      phone: profile?.phone ?? "",
      city: profile?.city ?? "",
      state: profile?.state ?? "",
      zip: profile?.zip ?? "",
      bio: profile?.bio ?? "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        toast.error(result.error || "Failed to save profile");
        return;
      }

      toast.success("Profile saved!");
      window.location.assign("/dashboard");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Personal & Business Info</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
              <Input id="fullName" {...register("fullName")} className={errors.fullName ? "border-destructive" : ""} />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" placeholder="Optional" {...register("businessName")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" {...register("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input id="zip" placeholder="77001" maxLength={5} {...register("zip")} className={errors.zip ? "border-destructive" : ""} />
              {errors.zip && <p className="text-xs text-destructive">{errors.zip.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Houston" {...register("city")} />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <select
                {...register("state")}
                className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select state...</option>
                {US_STATES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">About You / Business</Label>
            <Textarea
              id="bio"
              placeholder="Tell buyers about your experience and container inventory..."
              rows={3}
              {...register("bio")}
            />
          </div>

          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
