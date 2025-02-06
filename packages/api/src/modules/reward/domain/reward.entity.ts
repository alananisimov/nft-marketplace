import type { BaseEntity } from "../../../shared/domain/types";
import type { NFTRewardResponse, RewardResponse } from "../application/dto";
import type {
  NFTRewardFromDB,
  NFTRewardProps,
  RewardFromDB,
  RewardProps,
} from "./types";
import { DomainError } from "../../../shared/domain/errors";

export class RewardEntity {
  private constructor(private props: RewardProps) {}

  static fromDB(data: RewardFromDB): RewardEntity {
    return RewardEntity.create({
      id: data.id,
      name: data.name,
      image: data.image,
      symbol: data.symbol,
      issuer: data.issuer,
    });
  }

  static create(
    props: Omit<RewardProps, keyof BaseEntity> & Partial<BaseEntity>,
  ): RewardEntity {
    return new RewardEntity({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      createdAt: new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get issuer(): string {
    return this.props.issuer;
  }
  get image(): string {
    return this.props.image;
  }
  get symbol(): string {
    return this.props.symbol;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  toDTO(): RewardResponse {
    return {
      id: this.id,
      name: this.name,
      image: this.image,
      issuer: this.issuer,
      symbol: this.symbol,
      createdAt: this.createdAt,
    };
  }
}

export class NFTRewardEntity {
  private constructor(private props: NFTRewardProps) {}

  static create(
    props: Omit<NFTRewardProps, keyof BaseEntity> & Partial<BaseEntity>,
  ): NFTRewardEntity {
    if (props.monthlyPercentage < 0 || props.monthlyPercentage > 100) {
      throw new DomainError(
        "Percentage must be between 0 and 100",
        "INVALID_PERCENTAGE",
      );
    }

    return new NFTRewardEntity({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      createdAt: new Date(),
    });
  }

  static fromDB(data: NFTRewardFromDB): NFTRewardEntity {
    return NFTRewardEntity.create({
      ...data,
      updatedAt: data.updatedAt ?? undefined,
      reward: RewardEntity.fromDB(data.reward),
    });
  }

  get id(): string {
    return this.props.id;
  }
  get nftId(): string {
    return this.props.nftId;
  }
  get rewardId(): string {
    return this.props.rewardId;
  }
  get monthlyPercentage(): number {
    return this.props.monthlyPercentage;
  }
  get reward(): RewardEntity | undefined {
    return this.props.reward;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  toDTO(): NFTRewardResponse {
    if (!this.reward) {
      throw new DomainError(
        "Cannot convert to DTO without reward data",
        "INVALID_STATE",
      );
    }

    return {
      id: this.id,
      nftId: this.nftId,
      rewardId: this.rewardId,
      monthlyPercentage: this.monthlyPercentage,
      reward: this.reward.toDTO(),
      createdAt: this.createdAt,
    };
  }
}
