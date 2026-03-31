import { CONDITION_COLORS, CONDITION_LABELS } from "@/lib/constants/containers";
import { cn } from "@/lib/utils";

interface ConditionBadgeProps {
  condition: string;
  className?: string;
}

export function ConditionBadge({ condition, className }: ConditionBadgeProps) {
  const colors = CONDITION_COLORS[condition] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
  };
  const label = CONDITION_LABELS[condition] ?? condition;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {label}
    </span>
  );
}
