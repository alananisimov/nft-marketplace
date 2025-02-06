import type { NFT } from "@acme/db/schema";

import type { BaseEntity } from "../../../shared/domain/types";
import type { CollectionResponse } from "../application/dto";
import { DomainError } from "../../../shared/domain/errors";
import { NFTEntity } from "../../nft/domain/nft.entity";

type NFTFromDB = typeof NFT.$inferSelect;

interface CollectionProps extends BaseEntity {
  name: string;
  description: string;
  nfts: NFTEntity[];
}

export class CollectionEntity {
  private constructor(private props: CollectionProps) {}

  static create(
    props: Omit<CollectionProps, keyof BaseEntity> & Partial<BaseEntity>,
  ): CollectionEntity {
    if (!props.name || props.name.length > 255) {
      throw new DomainError(
        "Collection name must be between 1 and 255 characters",
        "INVALID_NAME",
      );
    }

    return new CollectionEntity({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      nfts: props.nfts,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get nfts(): NFTEntity[] | undefined {
    return this.props.nfts;
  }

  get image(): string {
    return this.props.nfts[0]?.image ?? "http://localhost:30001/123";
  }

  get priceChange(): number {
    if (!this.props.nfts.length) {
      return 0;
    }
    return (
      this.props.nfts.reduce((psum, a) => psum + a.priceChange, 0) /
      this.props.nfts.length
    );
  }

  get totalPrice(): number {
    return this.props.nfts.reduce((sum, nft) => sum + nft.currentBid, 0);
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  static fromDB(data: NFTFromDB): NFTEntity {
    return NFTEntity.create({
      assetCode: data.assetCode,
      name: data.name,
      description: data.description,
      image: data.image,
      lockupPeriod: data.lockupPeriod,
      domain: data.domain,
      code: data.code,
      issuerPubkey: data.issuerPubkey,
      issuerPrivatekey: data.issuerPrivatekey,
      distribPubkey: data.distribPubkey,
      distribPrivatekey: data.distribPrivatekey,
      collectionId: data.collectionId,
    });
  }

  toDTO(): CollectionResponse {
    return {
      id: this.props.id,
      name: this.props.name,
      description: this.props.description,
      image: this.image,
      priceChange: this.priceChange,
      price: this.totalPrice,
      nfts: this.props.nfts.map((nft) => nft.toDTO()),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
