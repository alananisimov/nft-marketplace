import "reflect-metadata";

import type { Horizon } from "@stellar/stellar-sdk";
import { Asset } from "@stellar/stellar-sdk";

import type { MarketData } from "../domain/types";
import { logger } from "../../../utils/logger";
import { server } from "../../../utils/stellar-server";

interface NFTAsset {
  assetCode: string;
  issuerPubkey: string;
}

export class MarketService {
  private readonly server: Horizon.Server;
  private readonly REQUEST_TIMEOUT = 5000;
  private readonly BATCH_SIZE = 10;

  constructor() {
    this.server = server;
  }

  async batchGetMarketData(
    nftList: NFTAsset[],
  ): Promise<Record<string, MarketData>> {
    try {
      const batches = this.chunkArray(nftList, this.BATCH_SIZE);
      const allResults: Record<string, MarketData> = {};

      for (const batch of batches) {
        const batchResults = await Promise.allSettled(
          batch.map((nft) =>
            this.getMarketData(nft.assetCode, nft.issuerPubkey),
          ),
        );

        batch.forEach((nft, index) => {
          allResults[nft.assetCode] =
            batchResults[index]?.status === "fulfilled"
              ? batchResults[index].value
              : this.defaultMarketData(nft);
        });
      }

      return allResults;
    } catch (error) {
      logger.error({ error }, "Failed to batch get market data");
      return nftList.reduce(
        (acc, nft) => {
          acc[nft.assetCode] = this.defaultMarketData(nft);
          return acc;
        },
        {} as Record<string, MarketData>,
      );
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    return array.reduce((acc, item, i) => {
      const chunkIndex = Math.floor(i / size);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(item);
      return acc;
    }, [] as T[][]);
  }

  private defaultMarketData(nft: NFTAsset): MarketData {
    return {
      priceChange: 0,
      currentBid: 0,
      marketLink: `https://lobstr.co/trade/${nft.assetCode}:${nft.issuerPubkey}`,
    };
  }

  async getMarketData(
    assetCode: string,
    issuerPubkey: string,
  ): Promise<MarketData> {
    const defaultData = this.defaultMarketData({ assetCode, issuerPubkey });

    try {
      logger.debug({ assetCode, issuerPubkey }, "Fetching market data");

      const [orderbook, trades] = await Promise.allSettled([
        this.fetchOrderbook(assetCode, issuerPubkey),
        this.fetchTrades(assetCode, issuerPubkey),
      ]);

      if (orderbook.status === "rejected" || trades.status === "rejected") {
        return defaultData;
      }

      const currentPrice = this.extractCurrentPrice(orderbook.value);
      const oldPrice = this.extractOldPrice(trades.value);
      const priceChange = this.calculatePriceChange(currentPrice, oldPrice);

      return {
        priceChange: parseFloat(priceChange.toFixed(2)),
        currentBid: currentPrice,
        marketLink: `https://lobstr.co/trade/${assetCode}:${issuerPubkey}`,
      };
    } catch (error) {
      logger.error(
        {
          error,
          assetCode,
          issuerPubkey,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
        "Error fetching market data",
      );
      return defaultData;
    }
  }

  private async fetchOrderbook(
    assetCode: string,
    issuerPubkey: string,
  ): Promise<Horizon.ServerApi.OrderbookRecord> {
    const asset = new Asset(assetCode, issuerPubkey);
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.REQUEST_TIMEOUT,
    );

    try {
      const orderbook = await this.server
        .orderbook(asset, Asset.native())
        .call();
      clearTimeout(timeoutId);

      return orderbook;
    } catch (e) {
      const error = e as Error;
      clearTimeout(timeoutId);
      logger.warn(
        { error: error.message, assetCode },
        "Orderbook fetch failed",
      );

      throw error;
    }
  }

  private async fetchTrades(
    assetCode: string,
    issuerPubkey: string,
  ): Promise<Horizon.ServerApi.TradeRecord[]> {
    const asset = new Asset(assetCode, issuerPubkey);
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.REQUEST_TIMEOUT,
    );

    try {
      const tradesResponse = await this.server
        .trades()
        .forAssetPair(asset, Asset.native())
        .limit(200)
        .call();
      clearTimeout(timeoutId);

      return tradesResponse.records;
    } catch (e) {
      const error = e as Error;
      clearTimeout(timeoutId);
      logger.warn({ error: error.message, assetCode }, "Trades fetch failed");

      throw error;
    }
  }

  private extractCurrentPrice(
    orderbook: Horizon.ServerApi.OrderbookRecord,
  ): number {
    return orderbook.bids[0] ? parseFloat(orderbook.bids[0].price) : 0;
  }

  private extractOldPrice(trades: Horizon.ServerApi.TradeRecord[]): number {
    if (!trades.length) return 0;

    const oldestTrade = trades[trades.length - 1];
    if (!oldestTrade?.price) {
      return 0;
    }

    const { n: numerator, d: denominator } = oldestTrade.price;
    const num = parseFloat(numerator);
    const den = parseFloat(denominator);

    if (isNaN(num) || isNaN(den) || den === 0) {
      return 0;
    }

    return num / den;
  }

  private calculatePriceChange(currentPrice: number, oldPrice: number): number {
    if (oldPrice === 0) return 0;
    return ((currentPrice - oldPrice) / oldPrice) * 100;
  }
}
