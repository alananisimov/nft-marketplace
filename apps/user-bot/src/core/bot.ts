import type { Context } from "telegraf";
import { Telegraf } from "telegraf";

import { config } from "~/config";
import { loggerMiddleware } from "~/middlewares";
import { initializeCommands } from "./commands";

export class Bot {
  private bot: Telegraf<Context>;

  constructor() {
    this.bot = new Telegraf<Context>(config.bot.token);
    this.setupMiddlewares();
    this.setupCommands();
  }

  private setupMiddlewares(): void {
    this.bot.use(loggerMiddleware);
  }

  private setupCommands(): void {
    initializeCommands(this.bot);
  }

  public async start(): Promise<void> {
    try {
      await this.bot.launch();
      console.log("🤖 Bot started successfully");
      this.setupGracefulShutdown();
    } catch (error) {
      console.error("Failed to start bot:", error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = () => this.bot.stop("SIGTERM");
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  }
}
