import { cookies } from "next/headers";

/**
 * Calculates the current Indian Financial Year (starts Apr 1st, ends Mar 31st).
 * Returns format "YYYY-YY" (e.g. "2026-27").
 */
export function getCurrentFinancialYear(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed: January is 0, April is 3
  
  if (month >= 3) {
    // April to December: Current Year - Next Year (short)
    const nextYearShort = String(year + 1).slice(-2);
    return `${year}-${nextYearShort}`;
  } else {
    // January to March: Previous Year - Current Year (short)
    const prevYear = year - 1;
    const currentYearShort = String(year).slice(-2);
    return `${prevYear}-${currentYearShort}`;
  }
}

/**
 * Gets the currently selected financial year from cookies,
 * falling back to the current financial year if not set.
 */
export async function getSelectedFinancialYear(): Promise<string> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("financial_year")?.value || getCurrentFinancialYear();
  } catch (err) {
    console.error("Failed to read financial_year cookie:", err);
    return getCurrentFinancialYear();
  }
}
