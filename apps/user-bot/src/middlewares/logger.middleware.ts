import type { Context } from "telegraf";

export async function loggerMiddleware(
  ctx: Context,
  next: () => Promise<void>,
) {
  const start = Date.now();
  const updateType = ctx.updateType;
  const updateId = ctx.update.update_id;

  console.log(`Processing update ${updateId} [${updateType}]`);

  try {
    await next();
    const duration = Date.now() - start;
    console.log(`Update ${updateId} processed in ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - start;
    console.error(
      `Error processing update ${updateId} after ${duration}ms:`,
      error,
    );
    throw error;
  }
}
