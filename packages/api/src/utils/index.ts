interface StakingEarnedParams {
  lockupPeriod: Date;
  monthlyPercentage: number;
}

export function calculateEarnedPercent({
  lockupPeriod,
  monthlyPercentage,
}: StakingEarnedParams): number {
  const now = new Date();
  const startTime = now.getTime();
  const lockupTime = lockupPeriod.getTime();

  if (startTime < lockupTime) {
    return 0;
  }

  const timeDiff = startTime - lockupTime;
  const monthsStaked = timeDiff / (1000 * 60 * 60 * 24 * 30.44);

  const earned = monthsStaked * monthlyPercentage;

  return Math.max(0, Math.floor(earned));
}
