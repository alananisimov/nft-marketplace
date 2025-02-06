import { useTimeLeft } from "../hooks/use-time-left";

interface ClockCountdownProps {
  expiresAt: Date;
  isVerified?: boolean;
}

export function ClockCountdown({ expiresAt, isVerified }: ClockCountdownProps) {
  const timeLeft = useTimeLeft(expiresAt, isVerified);

  if (!timeLeft) return null;

  return (
    <div className="text-center text-sm text-muted-foreground">
      Verification expires in: {timeLeft}
    </div>
  );
}
