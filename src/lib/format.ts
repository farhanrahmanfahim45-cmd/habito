const TAKA = "\u09F3";

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** The active language, published on <html> by the i18n provider. */
function activeLanguage(): "en" | "bn" {
  if (typeof document === "undefined") return "en";
  return document.documentElement.dataset.lang === "bn" ? "bn" : "en";
}

/** Bengali numerals where the interface is in Bangla. */
function digits(text: string): string {
  if (activeLanguage() !== "bn") return text;
  return text.replace(/\d/g, (d) => BENGALI_DIGITS[Number(d)]);
}

export function money(amount: number): string {
  return TAKA + digits(amount.toLocaleString("en-IN"));
}

/** Compact form for map markers and dense chips: ৳12K, ৳8.5K, ৳45L */
export function moneyCompact(amount: number): string {
  if (amount >= 10_000_00) {
    const lakh = amount / 100000;
    return `${TAKA}${digits(lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1))}${activeLanguage() === "bn" ? "লা" : "L"}`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `${TAKA}${digits(k % 1 === 0 ? k.toFixed(0) : k.toFixed(1))}${activeLanguage() === "bn" ? "হা" : "K"}`;
  }
  return money(amount);
}

export function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

export function lastUpdatedLabel(iso: string): string {
  const d = daysSince(iso);
  if (d === 0) return "Updated today";
  if (d === 1) return "Updated yesterday";
  if (d < 30) return `Updated ${d} days ago`;
  const months = Math.floor(d / 30);
  return `Updated ${months} month${months > 1 ? "s" : ""} ago`;
}

export function lastUpdatedShort(iso: string): string {
  const d = daysSince(iso);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  if (d < 35) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export function isStale(iso: string): boolean {
  return daysSince(iso) > 21;
}

export function longDate(iso: string): string {
  const locale = activeLanguage() === "bn" ? "bn-BD" : "en-GB";
  return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

export function shortDate(iso: string): string {
  const locale = activeLanguage() === "bn" ? "bn-BD" : "en-GB";
  return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short" });
}

export function availabilityLine(iso: string): string {
  const diff = Math.floor((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (diff <= 0) return "Available now";
  if (diff <= 31) return `Available in ${diff} day${diff > 1 ? "s" : ""}`;
  return `Available from ${longDate(iso)}`;
}
