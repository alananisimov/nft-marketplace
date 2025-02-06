import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { env } from "~/app/config/env";

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  // eslint-disable-next-line no-restricted-properties
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input);
  return date
    .toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .split("/")
    .join(".");
}

export function formatPrice(input: number): string {
  // Convert the input to a number
  return input.toLocaleString();
}

export function formatPriceChange(change: number): string {
  if (change > 0) {
    return `+${change.toFixed(2)}%`;
  }
  return `${change.toFixed(2)}%`;
}

export function formatDeliveryDate(date: Date): string {
  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const day = date.getDate();

  const month = monthNames[date.getMonth()];

  return `${day} ${month}`;
}

export function formatTimeUntil(targetDate: Date): string {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    return "00h 00m 00s";
  }

  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  const paddedHours = hours.toString().padStart(2, "0");
  const paddedMinutes = minutes.toString().padStart(2, "0");
  const paddedSeconds = seconds.toString().padStart(2, "0");

  return `${paddedHours}h ${paddedMinutes}m ${paddedSeconds}s`;
}

export function getTimeFromNow(targetDate: Date): string {
  const now = new Date(); // Get the current date
  const diffInMilliseconds = targetDate.getTime() - now.getTime(); // Difference in milliseconds

  if (diffInMilliseconds <= 0) {
    return "The date is in the past.";
  }

  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30); // Approximation for months
  const diffInYears = Math.floor(diffInDays / 365); // Approximation for years

  // Return the appropriate format
  if (diffInYears > 0) {
    return `${diffInYears} ${diffInYears === 1 ? "year" : "years"}`;
  } else if (diffInMonths > 0) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"}`;
  } else if (diffInDays > 0) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"}`;
  } else if (diffInHours > 0) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"}`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"}`;
  } else {
    return `${diffInSeconds} ${diffInSeconds === 1 ? "second" : "seconds"}`;
  }
}

export function formatCompactNumber(number: number | undefined | null): string {
  // Handle undefined, null, or zero
  if (number === undefined || number === null || number === 0) {
    return "0";
  }

  if (isNaN(number)) {
    return "0";
  }

  const suffixes = ["", "K", "M", "B", "T"];

  // Handle numbers less than 1000
  if (number < 1000) {
    return number.toString();
  }

  const magnitude = Math.floor(Math.log10(Math.abs(number)) / 3);
  const scaledNumber = number / Math.pow(10, magnitude * 3);
  const suffix = suffixes[Math.min(magnitude, suffixes.length - 1)];

  return `${scaledNumber.toFixed(1)}${suffix}`;
}

export function getRandomFutureDate(baseDate: Date, hoursRange: number): Date {
  const randomHours = Math.floor(Math.random() * hoursRange) + 1;
  const futureDate = new Date(baseDate);
  futureDate.setHours(baseDate.getHours() + randomHours);
  return futureDate;
}
