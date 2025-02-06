import { PgQueryResultHKT, PgTransaction } from "drizzle-orm/pg-core";
import { ExtractTablesWithRelations } from "drizzle-orm/relations";
import { injectable } from "tsyringe";

import { db } from "@acme/db/client";
import * as schema from "@acme/db/schema";

import { logger } from "../../utils/logger";

export type Transaction = PgTransaction<
  PgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export interface IUnitOfWork {
  start(): void;
  complete(): Promise<void>;
  rollback(): void;
  getTransaction(): Transaction;
}

@injectable()
export class DrizzleUnitOfWork implements IUnitOfWork {
  private tx?: Transaction;
  private txPromise?: Promise<Transaction>;

  start() {
    if (this.tx) {
      throw new Error("Transaction already started");
    }

    this.txPromise = new Promise((resolve) => {
      void db.transaction(async (tx) => {
        this.tx = tx;
        try {
          await new Promise(() => {
            return;
          });
          resolve(tx);
        } catch (error) {
          throw error instanceof Error ? error : new Error(String(error));
        }
      });
    });
  }

  async complete(): Promise<void> {
    if (!this.tx) {
      throw new Error("No transaction in progress");
    }
    await this.txPromise;
    this.tx = undefined;
    this.txPromise = undefined;
    logger.debug("Transaction committed");
  }

  rollback(): void {
    if (!this.tx) {
      throw new Error("No transaction in progress");
    }
    this.tx.rollback();
    this.tx = undefined;
    logger.debug("Transaction rolled back");
  }

  getTransaction(): Transaction {
    if (!this.tx) {
      throw new Error("No transaction in progress");
    }
    return this.tx;
  }
}
