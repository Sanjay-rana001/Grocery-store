import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Formats Tailwind v4 classes cleanly (equivalent to ShadCN's cn)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatting NZ Currency ($5.50 NZD)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD'
  }).format(amount);
}

// Simple Date formatter (e.g. 25 May 2026)
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Generate delivery slots for next 5 days
export function generateDeliveryDates(): string[] {
  const dates: string[] = [];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 1; i <= 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayName = days[d.getDay()];
    const dateNum = d.getDate();
    const monthName = months[d.getMonth()];
    dates.push(`${dayName}, ${dateNum} ${monthName}`);
  }
  
  return dates;
}
