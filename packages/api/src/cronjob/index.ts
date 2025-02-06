import { CronJob } from "cron";
import { container } from "../container";

import { StakingService } from "../modules/staking/application/staking.service";
import { logger } from "../utils/logger";

export function initCronJobs() {
  const updateEarnedJob = new CronJob(
    "0 */1 * * *",
    async () => {
      logger.info("Starting earned update cron job");
      try {
        const stakingService = container.resolve(StakingService);
        await stakingService.updateEarnedForAllStakings();
        logger.info("Completed earned update cron job");
      } catch (error) {
        logger.error({ error }, "Error in earned update cron job");
      }
    },
    null,
    true,
    "UTC",
  );

  updateEarnedJob.start();
  logger.info("Cron jobs initialized");
}
