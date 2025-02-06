import { Horizon, Networks, Transaction } from "@stellar/stellar-sdk";

import { env } from "../../../env";
import { DomainError } from "../../../shared/domain/errors";
import { logger } from "../../../utils/logger";

interface StellarTransaction {
  id: string;
  memo?: string;
  created_at: string;
  source_account: string;
  successful: boolean;
}

export class StellarService {
  private readonly server: Horizon.Server;
  private readonly networkPassphrase: string;

  constructor() {
    this.server = new Horizon.Server(env.STELLAR_HORIZON_URL);
    this.networkPassphrase =
      env.STELLAR_NETWORK === "PUBLIC" ? Networks.PUBLIC : Networks.TESTNET;
  }

  async getAccountTransactions(
    accountId: string,
    limit = 10,
  ): Promise<StellarTransaction[]> {
    try {
      logger.debug({ accountId, limit }, "Fetching account transactions");

      const response = await this.server
        .transactions()
        .forAccount(accountId)
        .limit(limit)
        .order("desc")
        .call();

      const transactions = response.records.map((tx) => ({
        id: tx.id,
        memo: tx.memo,
        created_at: tx.created_at,
        source_account: tx.source_account,
        successful: tx.successful,
      }));

      logger.debug(
        {
          data: {
            accountId,
            count: transactions.length,
          },
        },
        "Successfully fetched transactions",
      );

      return transactions;
    } catch (error) {
      logger.error(
        {
          data: {
            error,
            accountId,
          },
        },
        "Failed to fetch account transactions",
      );
      throw new DomainError(
        "Failed to fetch account transactions",
        "STELLAR_ERROR",
      );
    }
  }

  async verifyTransaction(
    accountId: string,
    expectedMemo: string,
  ): Promise<boolean> {
    try {
      logger.debug({ accountId, expectedMemo }, "Verifying transaction");

      const transactions = await this.getAccountTransactions(accountId);

      const verifiedTransaction = transactions.find(
        (tx) =>
          tx.successful &&
          tx.memo === expectedMemo &&
          this.isTransactionRecent(tx.created_at),
      );

      const isVerified = !!verifiedTransaction;

      logger.debug(
        {
          data: {
            accountId,
            expectedMemo,
            isVerified,
          },
        },
        "Transaction verification result",
      );

      return isVerified;
    } catch (error) {
      logger.error(
        {
          data: {
            error,
            accountId,
            expectedMemo,
          },
        },
        "Failed to verify transaction",
      );
      return false;
    }
  }

  async getAccountBalance(accountId: string): Promise<number> {
    try {
      logger.debug({ accountId }, "Fetching account balance");

      const account = await this.server.loadAccount(accountId);
      const balance = account.balances.find((b) => b.asset_type === "native");

      if (!balance) {
        throw new DomainError("No XLM balance found", "STELLAR_ERROR");
      }

      const xlmBalance = parseFloat(balance.balance);

      logger.debug(
        {
          data: {
            accountId,
            balance: xlmBalance,
          },
        },
        "Successfully fetched balance",
      );

      return xlmBalance;
    } catch (error) {
      logger.error({ error, accountId }, "Failed to fetch account balance");
      throw new DomainError("Failed to fetch account balance", "STELLAR_ERROR");
    }
  }

  async submitTransaction(
    signedXdr: string,
  ): Promise<Horizon.HorizonApi.SubmitTransactionResponse> {
    try {
      logger.debug("Submitting transaction");

      const transaction = new Transaction(signedXdr, this.networkPassphrase);
      const result = await this.server.submitTransaction(transaction);

      logger.debug(
        {
          data: {
            hash: result.hash,
          },
        },
        "Successfully submitted transaction",
      );

      return result;
    } catch (error) {
      logger.error({ error }, "Failed to submit transaction");
      throw new DomainError("Failed to submit transaction", "STELLAR_ERROR");
    }
  }

  private isTransactionRecent(timestamp: string): boolean {
    const txDate = new Date(timestamp);
    const now = new Date();
    const differenceInMinutes =
      (now.getTime() - txDate.getTime()) / (1000 * 60);

    // Транзакция считается актуальной, если она произошла не более 20 минут назад
    return differenceInMinutes <= 20;
  }
}
