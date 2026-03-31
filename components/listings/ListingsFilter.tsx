"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CONTAINER_TYPES, CONTAINER_CONDITIONS } from "@/lib/constants/containers";
import { US_STATES } from "@/lib/constants/states";

interface ListingsFilterProps {
  currentParams: {
    type?: string;
    condition?: string;
    state?: string;
    min?: string;
    max?: string;
    sort?: string;
  };
}

export function ListingsFilter({ currentParams }: ListingsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams();
    const current = { ...currentParams };
    if (value) {
      current[key as keyof typeof current] = value;
    } else {
      delete current[key as keyof typeof current];
    }
    Object.entries(current).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-sm mb-3">Container Type</h2>
        <div className="space-y-2">
          {CONTAINER_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() =>
                updateFilter(
                  "type",
                  currentParams.type === type.value ? undefined : type.value
                )
              }
              className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                currentParams.type === type.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="font-semibold text-sm mb-3">Condition</h2>
        <div className="space-y-2">
          {CONTAINER_CONDITIONS.map((cond) => (
            <button
              key={cond.value}
              onClick={() =>
                updateFilter(
                  "condition",
                  currentParams.condition === cond.value ? undefined : cond.value
                )
              }
              className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                currentParams.condition === cond.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              {cond.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="font-semibold text-sm mb-3">State</h2>
        <select
          value={currentParams.state ?? ""}
          onChange={(e) => updateFilter("state", e.target.value || undefined)}
          className="w-full text-sm border border-border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All States</option>
          {US_STATES.map((state) => (
            <option key={state.value} value={state.value}>
              {state.label}
            </option>
          ))}
        </select>
      </div>

      <Separator />

      <div>
        <h2 className="font-semibold text-sm mb-3">Price Range</h2>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min $"
            defaultValue={currentParams.min}
            onBlur={(e) => updateFilter("min", e.target.value || undefined)}
            className="w-full text-sm border border-border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="text-muted-foreground text-sm">–</span>
          <input
            type="number"
            placeholder="Max $"
            defaultValue={currentParams.max}
            onBlur={(e) => updateFilter("max", e.target.value || undefined)}
            className="w-full text-sm border border-border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {Object.values(currentParams).some(Boolean) && (
        <>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => router.push(pathname)}
          >
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );
}
