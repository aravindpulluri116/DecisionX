/** Indian Rupee formatting — project budgets use ₹ crore (Cr). */
export const BUDGET_UNIT = "₹ crore";
export const BUDGET_UNIT_SHORT = "₹ Cr";

export function formatBudgetCrore(value: number, options?: { compact?: boolean }): string {
  const n = options?.compact ? String(value) : value.toLocaleString("en-IN");
  return `₹${n} Cr`;
}
