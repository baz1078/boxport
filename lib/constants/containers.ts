export const CONTAINER_TYPES = [
  { value: "20ft", label: "20ft Standard" },
  { value: "40ft", label: "40ft Standard" },
  { value: "40ft_high_cube", label: "40ft High Cube" },
  { value: "reefer", label: "Refrigerated (Reefer)" },
  { value: "open_top", label: "Open Top" },
  { value: "flat_rack", label: "Flat Rack" },
  { value: "tank", label: "Tank Container" },
] as const;

export const CONTAINER_CONDITIONS = [
  {
    value: "one_trip",
    label: "One-Trip",
    description: "Used once, near-new condition",
    color: "emerald",
  },
  {
    value: "cargo_worthy",
    label: "Cargo Worthy",
    description: "Certified for international cargo transport",
    color: "blue",
  },
  {
    value: "wind_water_tight",
    label: "Wind & Water Tight",
    description: "Structurally sound, keeps out elements",
    color: "yellow",
  },
  {
    value: "as_is",
    label: "As-Is",
    description: "Sold as-is, buyer accepts condition",
    color: "gray",
  },
] as const;

export type ContainerType = (typeof CONTAINER_TYPES)[number]["value"];
export type ContainerCondition =
  (typeof CONTAINER_CONDITIONS)[number]["value"];

export const CONTAINER_TYPE_LABELS: Record<string, string> = {
  "20ft": "20ft Standard",
  "40ft": "40ft Standard",
  "40ft_high_cube": "40ft High Cube",
  reefer: "Refrigerated (Reefer)",
  open_top: "Open Top",
  flat_rack: "Flat Rack",
  tank: "Tank Container",
};

export const CONDITION_LABELS: Record<string, string> = {
  one_trip: "One-Trip",
  cargo_worthy: "Cargo Worthy",
  wind_water_tight: "Wind & Water Tight",
  as_is: "As-Is",
};

export const CONDITION_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  one_trip: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  cargo_worthy: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  wind_water_tight: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
  },
  as_is: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
  },
};
