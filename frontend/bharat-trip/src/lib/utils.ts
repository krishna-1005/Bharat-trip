import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getNextThreeMonths() {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const now = new Date();
  const startMonthIndex = now.getMonth();
  
  const start = months[startMonthIndex];
  const end = months[(startMonthIndex + 3) % 12];
  
  return `${start} – ${end}`;
}
