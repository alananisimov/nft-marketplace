import { getTimeFromNow } from "~/shared/utils";

interface LockupPeriodProps {
  lockupPeriod: number;
}

export function LockupPeriod({ lockupPeriod }: LockupPeriodProps) {
  const now = new Date();
  const lockupDate = new Date();
  lockupDate.setDate(now.getDate() + lockupPeriod);
  return (
    <span className="flex flex-row justify-between">
      <p>Staking lockup period</p>
      <p>{getTimeFromNow(lockupDate)}</p>
    </span>
  );
}
