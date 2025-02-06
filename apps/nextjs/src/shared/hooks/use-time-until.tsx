"use client";

import { useEffect, useState } from "react";

export function useTimeUntil(targetDate: Date): string {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    function calculateTimeLeft(): string {
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

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Set up interval to update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}
