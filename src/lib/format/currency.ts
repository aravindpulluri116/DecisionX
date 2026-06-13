/** Indian Rupee formatting — project budgets use ₹ crore (Cr). */
export const BUDGET_UNIT = "₹ crore";
export const BUDGET_UNIT_SHORT = "₹ Cr";

export function formatBudgetCrore(value: number, options?: { compact?: boolean }): string {
  const n = options?.compact ? String(value) : value.toLocaleString("en-IN");
  return `₹${n} Cr`;
}

export function formatINR(
  amount: number,
  options?: { maximumFractionDigits?: number; notation?: "compact" | "standard" },
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
    notation: options?.notation ?? "standard",
  }).format(amount);
}
