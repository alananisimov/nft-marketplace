import { useEffect, useState } from "react";

export function useTimeLeft(expiresAt: Date, isVerified?: boolean) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (isVerified) return;

    const timer = setInterval(() => {
      const now = new Date();
      const end = expiresAt;
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft("00:00");
        return;
      }

      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`,
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, isVerified]);

  return timeLeft;
}
