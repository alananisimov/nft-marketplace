import { Scenes, session, Telegraf } from "telegraf";

import type { BotContext } from "~/types";
import { config } from "~/config";
import { errorHandler, loggerMiddleware } from "~/middlewares";
import { initializeScenes } from "~/scenes";
import { initializeCommands } from "./commands";

export class Bot {
  private bot: Telegraf<BotContext>;
  private stage: Scenes.Stage<BotContext>;

  constructor() {
    this.bot = new Telegraf<BotContext>(config.bot.token);
    this.stage = new Scenes.Stage<BotContext>(initializeScenes(), {
      ttl: config.session.ttl,
    });
    this.setupMiddlewares();
    this.setupCommands();
  }

  private setupMiddlewares(): void {
    this.bot.use(
      session({
        defaultSession: () => ({
          collection: {},
          nft: {},
          reward: {},
          pagination: {
            page: config.pagination.defaultPage,
            itemsPerPage: config.pagination.itemsPerPage,
          },
        }),
      }),
    );
    this.bot.use(this.stage.middleware());
    this.bot.use(loggerMiddleware);
    this.bot.catch(errorHandler);
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
