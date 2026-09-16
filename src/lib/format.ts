import { format, differenceInYears, differenceInMonths } from "date-fns";
import { is } from "date-fns/locale";

export function formatDate(value: Date | string) {
  return format(new Date(value), "d. MMM yyyy", { locale: is });
}

export function formatDateTime(value: Date | string) {
  return format(new Date(value), "d. MMM yyyy HH:mm", { locale: is });
}

export function formatTime(value: Date | string) {
  return format(new Date(value), "HH:mm", { locale: is });
}

export function formatKr(amount: number) {
  return `${amount.toLocaleString("is-IS")} kr`;
}

export function ageLabel(birthDate: Date | string | null | undefined) {
  if (!birthDate) return "Aldur óskráður";
  const birth = new Date(birthDate);
  const years = differenceInYears(new Date(), birth);
  const months = differenceInMonths(new Date(), birth) % 12;
  if (years <= 0) return `${months} mán.`;
  if (months === 0) return `${years} ára`;
  return `${years} ára og ${months} mán.`;
}

export function datetimeLocal(value: Date | string = new Date()) {
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
