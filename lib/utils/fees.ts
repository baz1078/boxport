import { PLATFORM_FEE_PERCENT } from "@/lib/constants/config";

export function calculateFees(grossAmount: number): {
  grossAmount: number;
  platformFee: number;
  sellerPayout: number;
} {
  const platformFee = Math.round(grossAmount * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
  const sellerPayout = Math.round((grossAmount - platformFee) * 100) / 100;
  return { grossAmount, platformFee, sellerPayout };
}

export function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function toStripeAmount(dollars: number): number {
  return Math.round(dollars * 100);
}
