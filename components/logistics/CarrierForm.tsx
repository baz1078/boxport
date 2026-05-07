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
import { Checkbox } from "@/components/ui/checkbox";
import { US_STATES } from "@/lib/constants/states";
import { Loader2, CheckCircle } from "lucide-react";

const EQUIPMENT_TYPES = [
  { value: "flatbed", label: "Flatbed Truck" },
  { value: "tilt_bed", label: "Tilt-Bed / Roll-Off" },
  { value: "crane_truck", label: "Crane Truck" },
  { value: "lowboy", label: "Lowboy Trailer" },
  { value: "forklift", label: "Forklift / Reach Stacker" },
] as const;

const schema = z.object({
  businessName: z.string().min(2, "Business name required"),
  contactName: z.string().min(2, "Contact name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  dotNumber: z.string().optional(),
  serviceRadiusMiles: z.string().optional(),
  bio: z.string().max(500).optional(),
  website: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function CarrierForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [stateError, setStateError] = useState("");
  const [equipmentError, setEquipmentError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const toggleState = (val: string) => {
    setSelectedStates((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    );
    setStateError("");
  };

  const toggleEquipment = (val: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(val) ? prev.filter((e) => e !== val) : [...prev, val]
    );
    setEquipmentError("");
  };

  const onSubmit = async (data: FormData) => {
    if (selectedStates.length === 0) {
      setStateError("Select at least one state you serve");
      return;
    }
    if (selectedEquipment.length === 0) {
      setEquipmentError("Select at least one equipment type");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/logistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          serviceAreas: selectedStates.join(","),
          equipmentTypes: selectedEquipment.join(","),
          serviceRadiusMiles: data.serviceRadiusMiles ? Number(data.serviceRadiusMiles) : undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Something went wrong");
        return;
      }

      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16 space-y-4">
        <CheckCircle className="h-14 w-14 text-emerald-600 mx-auto" />
        <h2 className="text-2xl font-bold">Application Received!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Thanks for joining BoxPort Logistics. We'll review your information and get you listed
          within 1–2 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="businessName">Business Name <span className="text-destructive">*</span></Label>
              <Input id="businessName" placeholder="Acme Container Hauling LLC" {...register("businessName")} className={errors.businessName ? "border-destructive" : ""} />
              {errors.businessName && <p className="text-xs text-destructive">{errors.businessName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactName">Your Name <span className="text-destructive">*</span></Label>
              <Input id="contactName" placeholder="John Smith" {...register("contactName")} className={errors.contactName ? "border-destructive" : ""} />
              {errors.contactName && <p className="text-xs text-destructive">{errors.contactName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <Input id="email" type="email" placeholder="you@company.com" {...register("email")} className={errors.email ? "border-destructive" : ""} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
              <Input id="phone" type="tel" placeholder="(555) 000-0000" {...register("phone")} className={errors.phone ? "border-destructive" : ""} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dotNumber">USDOT Number</Label>
              <Input id="dotNumber" placeholder="Optional but recommended" {...register("dotNumber")} />
              <p className="text-xs text-muted-foreground">Helps buyers trust your operation</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input id="website" placeholder="https://yourcompany.com" {...register("website")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">About Your Operation</Label>
            <Textarea id="bio" placeholder="Years in business, types of containers you specialize in, anything buyers should know..." rows={3} {...register("bio")} />
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Equipment Types <span className="text-destructive">*</span></CardTitle>
          <p className="text-sm text-muted-foreground">What equipment do you use to move containers?</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EQUIPMENT_TYPES.map((eq) => (
              <div key={eq.value} className="flex items-center gap-2.5">
                <Checkbox
                  id={eq.value}
                  checked={selectedEquipment.includes(eq.value)}
                  onCheckedChange={() => toggleEquipment(eq.value)}
                />
                <Label htmlFor={eq.value} className="cursor-pointer font-normal">{eq.label}</Label>
              </div>
            ))}
          </div>
          {equipmentError && <p className="text-xs text-destructive mt-2">{equipmentError}</p>}
        </CardContent>
      </Card>

      {/* Service Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">States You Serve <span className="text-destructive">*</span></CardTitle>
          <p className="text-sm text-muted-foreground">Select all states where you can deliver containers.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
            {US_STATES.map((state) => (
              <div key={state.value} className="flex items-center gap-1.5">
                <Checkbox
                  id={`state-${state.value}`}
                  checked={selectedStates.includes(state.value)}
                  onCheckedChange={() => toggleState(state.value)}
                />
                <Label htmlFor={`state-${state.value}`} className="cursor-pointer font-normal text-xs">{state.label}</Label>
              </div>
            ))}
          </div>
          {stateError && <p className="text-xs text-destructive">{stateError}</p>}
          {selectedStates.length > 0 && (
            <p className="text-xs text-muted-foreground">{selectedStates.length} state{selectedStates.length !== 1 ? "s" : ""} selected</p>
          )}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={isLoading}>
        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Application"}
      </Button>
    </form>
  );
}
