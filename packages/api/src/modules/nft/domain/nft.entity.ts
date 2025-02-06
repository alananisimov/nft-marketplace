import type { NFT } from "@acme/db/schema";

import type { BaseEntity } from "../../../shared/domain/types";
import type { NFTProps } from "./types";
import { DomainError } from "../../../shared/domain/errors";

type NFTFromDB = typeof NFT.$inferSelect;

export class NFTEntity {
  private constructor(private props: NFTProps) {}

  static fromDB(data: NFTFromDB): NFTEntity {
    return NFTEntity.create({
      id: data.id,
      assetCode: data.assetCode,
      name: data.name,
      description: data.description,
      image: data.image,
      lockupPeriod: Number(data.lockupPeriod),
      domain: data.domain,
      code: data.code,
      issuerPubkey: data.issuerPubkey,
      issuerPrivatekey: data.issuerPrivatekey,
      distribPubkey: data.distribPubkey,
      distribPrivatekey: data.distribPrivatekey,
      collectionId: data.collectionId,
      updatedAt: data.updatedAt ?? new Date(),
    });
  }
  static create(
    props: Omit<NFTProps, keyof BaseEntity> & Partial<BaseEntity>,
  ): NFTEntity {
    if (!props.assetCode || props.assetCode.length > 12) {
      throw new DomainError(
        "Asset code must be between 1 and 12 characters",
        "INVALID_ASSET_CODE",
      );
    }

    return new NFTEntity({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }
  get assetCode(): string {
    return this.props.assetCode;
  }
  get name(): string {
    return this.props.name;
  }
  get description(): string {
    return this.props.description;
  }
  get collectionId(): string {
    return this.props.collectionId;
  }
  get issuerPubkey(): string {
    return this.props.issuerPubkey;
  }
  get issuerPrivatekey(): string {
    return this.props.issuerPrivatekey;
  }
  get distributorPubkey(): string {
    return this.props.distribPubkey;
  }
  get distributorPrivatekey(): string {
    return this.props.distribPrivatekey;
  }

  get currentBid(): number {
    return this.props.marketData?.currentBid ?? 0;
  }

  get priceChange(): number {
    return this.props.marketData?.priceChange ?? 0;
  }

  get marketLink(): string {
    return this.props.marketData?.marketLink ?? "";
  }
  get image(): string {
    return this.props.image;
  }
  get domain(): string {
    return this.props.domain;
  }
  get code(): string {
    return this.props.code;
  }
  get lockupPeriod(): number {
    return this.props.lockupPeriod;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  toDTO() {
    return {
      id: this.props.id,
      assetCode: this.props.assetCode,
      image: this.props.image,
      description: this.props.description,
      name: this.props.name,
      lockupPeriod: this.props.lockupPeriod,
      issuerPubkey: this.props.issuerPubkey,
      domain: this.props.domain,
      code: this.props.code,
      collectionId: this.props.collectionId,
      currentBid: this.currentBid,
      priceChange: this.priceChange,
      marketLink: this.marketLink,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
