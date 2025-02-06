import "reflect-metadata";

import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

import type { NFTEntity } from "../domain/nft.entity";
import { env } from "../../../env";
import { DomainError } from "../../../shared/domain/errors";
import { logger } from "../../../utils/logger";
import { server } from "../../../utils/stellar-server";

interface AssetData {
  assetCode: string;
  issuer: string;
  amount: string;
  marketValue?: number;
}

interface StellarError extends Error {
  response: unknown;
  message: string;
}

export class StellarService {
  private readonly server: Horizon.Server;

  constructor() {
    this.server = server;
  }

  createAccountsForTesting() {
    const issuer = Keypair.fromSecret(env.TEST_ISSUER_SK);
    const distrib = Keypair.fromSecret(env.TEST_DISTRIB_SK);
    return { issuer, distrib };
  }

  async createAccounts() {
    const issuer = Keypair.random();
    const distrib = Keypair.random();

    const adminKeypair = Keypair.fromSecret(env.ADMIN_PRIVATE_KEY);
    const adminAccount = await this.server.loadAccount(
      adminKeypair.publicKey(),
    );

    const tx = new TransactionBuilder(adminAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.PUBLIC,
    })
      .addOperation(
        Operation.createAccount({
          destination: issuer.publicKey(),
          startingBalance: "2.1",
        }),
      )
      .addOperation(
        Operation.createAccount({
          destination: distrib.publicKey(),
          startingBalance: "1.6",
        }),
      )
      .setTimeout(30)
      .build();

    tx.sign(adminKeypair);
    await this.server.submitTransaction(tx);

    return { issuer, distrib };
  }

  async setupNFTAsset(
    nft: NFTEntity,
    issuer: Keypair,
    distrib: Keypair,
  ): Promise<void> {
    const asset = new Asset(nft.assetCode, issuer.publicKey());

    const distribAccount = await this.server.loadAccount(distrib.publicKey());
    logger.debug("Loaded distrib account");

    const trustTx = new TransactionBuilder(distribAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.PUBLIC,
    })
      .addOperation(Operation.changeTrust({ asset }))
      .setTimeout(30)
      .build();

    trustTx.sign(distrib);
    const trust = await this.server.submitTransaction(trustTx).catch(function (
      error: StellarError,
    ) {
      logger.error({ error }, "Failed to change trust");
    });

    logger.debug({ trust }, "Added trust to distrib account");

    const issuerAccount = await this.server.loadAccount(issuer.publicKey());
    const mintTx = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.PUBLIC,
    })
      .addOperation(
        Operation.payment({
          destination: distrib.publicKey(),
          asset,
          amount: "0.0000001",
        }),
      )
      .setTimeout(30)
      .build();

    mintTx.sign(issuer);
    const mint = await this.server.submitTransaction(mintTx).catch(function (
      error: StellarError,
    ) {
      logger.error({ error }, "Failed to mint tx");
    });

    logger.debug({ mint }, "Minted to distrib account");

    const domainTx = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.PUBLIC,
    })
      .addOperation(
        Operation.setOptions({
          homeDomain: nft.domain,
        }),
      )
      .setTimeout(30)
      .build();

    domainTx.sign(issuer);
    const domain = await this.server
      .submitTransaction(domainTx)
      .catch(function (error: StellarError) {
        logger.error({ error }, "Failed to set domain metadata");
      });

    logger.debug({ domain }, "Added domain metadata to nft");

    await this.setNFTMetadata(nft, issuer);

    logger.debug(
      {
        assetCode: nft.assetCode,
        issuer: issuer.publicKey(),
      },
      "NFT asset setup completed",
    );
  }

  private async setNFTMetadata(nft: NFTEntity, issuer: Keypair): Promise<void> {
    try {
      const issuerAccount = await this.server.loadAccount(issuer.publicKey());
      logger.debug("Loaded issuer account");

      const encodeValue = (value: string): string => {
        const buffer = Buffer.from(value, "utf8");
        return buffer.slice(0, 64).toString("utf8");
      };

      const basicInfoTx = new TransactionBuilder(issuerAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.PUBLIC,
      })
        .addOperation(
          Operation.manageData({
            name: "image",
            value: encodeValue(nft.image),
          }),
        )
        .addOperation(
          Operation.manageData({
            name: "nft_id",
            value: encodeValue(nft.id),
          }),
        )
        .setTimeout(30)
        .build();

      basicInfoTx.sign(issuer);

      const tx = await this.server
        .submitTransaction(basicInfoTx)
        .catch(function (error: StellarError) {
          logger.error(
            { message: error.message, response: error.response },
            "Failed to set metadata",
          );
        });
      logger.debug({ tx }, "Basic NFT info set successfully");
    } catch (error) {
      logger.error({ error }, "Failed to set NFT metadata");
      throw new DomainError(
        `Failed to set NFT metadata: ${error instanceof Error ? error.message : "Unknown error"}`,
        "STELLAR_ERROR",
      );
    }
  }

  async getAccountAssets(publicKey: string): Promise<AssetData[]> {
    try {
      const getAssets = async () => {
        try {
          await this.server.loadAccount(publicKey);
        } catch (error) {
          logger.error(
            {
              error,
              message: error instanceof Error ? error.message : String(error),
            },
            "Failed to load account",
          );
          if (error instanceof Error && error.message.includes("404")) {
            return [];
          }
          throw error;
        }

        const account = await this.server.loadAccount(publicKey);

        return account.balances
          .filter(
            (balance: Horizon.HorizonApi.BalanceLine) =>
              balance.asset_type !== "native" &&
              "asset_code" in balance &&
              "asset_issuer" in balance,
          )
          .map((balance) => ({
            assetCode: balance.asset_code,
            issuer: balance.asset_issuer,
            amount: balance.balance,
          }));
      };

      const assets = await getAssets();

      logger.debug(
        {
          publicKey,
          assetsFound: assets.length,
          assets: assets,
        },
        "Account assets retrieved successfully",
      );

      return assets;
    } catch (error) {
      logger.error(
        {
          error,
          publicKey,
          errorMessage: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        "Failed to fetch account assets",
      );

      throw new DomainError(
        "Failed to fetch Stellar account assets",
        "STELLAR_ASSETS_ERROR",
      );
    }
  }

  // private async getAssetPrice(
  //   assetCode: string,
  //   issuer: string,
  // ): Promise<number> {
  //   try {
  //     logger.debug({ assetCode, issuer }, "Fetching asset price");

  //     const asset = new Asset(assetCode, issuer);
  //     const orderbook = await this.server
  //       .orderbook(asset, Asset.native())
  //       .call();

  //     if (!orderbook.bids.length) {
  //       return 0;
  //     }

  //     const price = parseFloat(orderbook.bids[0]?.price ?? "");

  //     logger.debug(
  //       {
  //         data: {
  //           assetCode,
  //           issuer,
  //           price,
  //         },
  //       },
  //       "Successfully fetched asset price",
  //     );

  //     return price;
  //   } catch (error) {
  //     logger.error({ error, assetCode, issuer }, "Failed to fetch asset price");
  //     return 0;
  //   }
  // }

  async getAssetHolders(assetCode: string, issuer: string): Promise<string[]> {
    try {
      logger.debug({ assetCode, issuer }, "Fetching asset holders");

      const accounts = await this.server
        .accounts()
        .forAsset(new Asset(assetCode, issuer))
        .limit(200)
        .call();

      const holders = accounts.records.map((account) => account.account_id);

      logger.debug(
        {
          data: {
            assetCode,
            issuer,
            holderCount: holders.length,
          },
        },
        "Successfully fetched asset holders",
      );

      return holders;
    } catch (error) {
      logger.error(
        {
          data: {
            error,
            assetCode,
            issuer,
          },
        },
        "Failed to fetch asset holders",
      );
      throw new DomainError(
        "Failed to fetch asset holders",
        "STELLAR_HOLDERS_ERROR",
      );
    }
  }

  async getAssetTransactions(
    assetCode: string,
    issuer: string,
    limit = 100,
  ): Promise<Horizon.ServerApi.PaymentOperationRecord[]> {
    try {
      logger.debug({ assetCode, issuer, limit }, "Fetching asset transactions");

      const operations = await this.server
        .operations()
        .limit(limit)
        .order("desc")
        .call();

      const assetTransactions = operations.records.filter((op) => {
        if (
          op.type === Horizon.HorizonApi.OperationResponseType.payment ||
          op.type === Horizon.HorizonApi.OperationResponseType.pathPayment ||
          op.type ===
            Horizon.HorizonApi.OperationResponseType.pathPaymentStrictSend
        ) {
          const paymentOp = op as Horizon.ServerApi.PaymentOperationRecord;
          return (
            paymentOp.asset_type !== "native" &&
            paymentOp.asset_code === assetCode &&
            paymentOp.asset_issuer === issuer
          );
        }
        return false;
      });

      logger.debug(
        {
          data: {
            assetCode,
            issuer,
            transactionCount: assetTransactions.length,
          },
        },
        "Successfully fetched asset transactions",
      );

      return assetTransactions as Horizon.ServerApi.PaymentOperationRecord[];
    } catch (error) {
      logger.error(
        {
          data: {
            error,
            assetCode,
            issuer,
          },
        },
        "Failed to fetch asset transactions",
      );
      throw new DomainError(
        "Failed to fetch asset transactions",
        "STELLAR_TRANSACTIONS_ERROR",
      );
    }
  }

  async getAccountBalance(publicKey: string): Promise<number> {
    try {
      const getBalance = async () => {
        try {
          await this.server.loadAccount(publicKey);
        } catch (error) {
          logger.error(
            {
              error,
              message: error instanceof Error ? error.message : String(error),
            },
            "Failed to load account",
          );
          if (error instanceof Error && error.message.includes("404")) {
            return 0;
          }
          throw error;
        }

        const account = await this.server.loadAccount(publicKey);

        return account.balances
          .filter(
            (balance: Horizon.HorizonApi.BalanceLine) =>
              balance.asset_type === "native",
          )
          .reduce((sum, balance) => sum + parseFloat(balance.balance), 0);
      };

      const balance = await getBalance();

      logger.debug(
        {
          publicKey,
          balance,
        },
        "Account balance retrieved successfully",
      );

      return balance;
    } catch (error) {
      logger.error(
        {
          error,
          publicKey,
          errorMessage: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        "Failed to fetch account balance",
      );

      throw new DomainError(
        "Failed to fetch Stellar account balance",
        "STELLAR_BALANCE_ERROR",
      );
    }
  }

  async getAssetsData(publicKey: string): Promise<{
    assets: AssetData[];
    totalValue: number;
  }> {
    try {
      logger.info({ publicKey }, "Fetching detailed assets data");

      const assets = await this.getAccountAssets(publicKey);

      const totalValue = assets.reduce((sum, asset) => {
        const value = asset.marketValue
          ? parseFloat(asset.amount) * asset.marketValue
          : 0;
        return sum + value;
      }, 0);

      const enrichedAssets = await Promise.all(
        assets.map(async (asset) => {
          try {
            const holders = await this.getAssetHolders(
              asset.assetCode,
              asset.issuer,
            );

            const recentTransactions = await this.getAssetTransactions(
              asset.assetCode,
              asset.issuer,
              5,
            );

            const volume24h = recentTransactions
              .filter((tx) => {
                const txTime = new Date(tx.created_at).getTime();
                const now = Date.now();
                return now - txTime <= 24 * 60 * 60 * 1000;
              })
              .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

            return {
              ...asset,
              holdersCount: holders.length,
              volume24h,
              lastTransactionTime: recentTransactions[0]?.created_at,
            };
          } catch (error) {
            logger.warn(
              {
                data: {
                  error,
                  asset: asset.assetCode,
                  issuer: asset.issuer,
                },
              },
              "Failed to fetch additional asset data",
            );
            return asset;
          }
        }),
      );

      logger.info(
        {
          data: {
            publicKey,
            assetCount: enrichedAssets.length,
            totalValue,
          },
        },
        "Successfully fetched detailed assets data",
      );

      return {
        assets: enrichedAssets,
        totalValue,
      };
    } catch (error) {
      logger.error(
        {
          data: {
            error,
            publicKey,
          },
        },
        "Failed to fetch detailed assets data",
      );
      throw new DomainError(
        "Failed to fetch detailed assets data",
        "STELLAR_ASSETS_DATA_ERROR",
      );
    }
  }
}
