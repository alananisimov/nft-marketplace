import type { BaseEntity } from "../../../shared/domain/types";
import type {
  ExtendedStakingResponse,
  StakingResponse,
} from "../application/dto";
import type { StakingFromDB, StakingProps } from "./types";
import { DomainError } from "../../../shared/domain/errors";

export class StakingEntity {
  private constructor(private props: StakingProps) {}

  static create(
    props: Omit<StakingProps, keyof BaseEntity> & Partial<BaseEntity>,
  ): StakingEntity {
    return new StakingEntity({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      createdAt: props.createdAt ?? new Date(),
    });
  }

  static fromDB(data: StakingFromDB): StakingEntity {
    return StakingEntity.create({
      ...data,
      nft: { ...data.nft, updatedAt: data.nft.updatedAt ?? undefined },
      lockupPeriod: new Date(data.lockupPeriod),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get nftId(): string {
    return this.props.nftId;
  }

  get nftRewardId(): string {
    return this.props.nftRewardId;
  }

  get earned(): number {
    return this.props.earned;
  }

  get lockupPeriod(): Date {
    return this.props.lockupPeriod;
  }

  get userId(): string {
    return this.props.userId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toDTO(): StakingResponse {
    return {
      ...this.props,
    } as StakingResponse;
  }

  toExtendedDTO(): ExtendedStakingResponse {
    if (!this.props.nft) {
      throw new DomainError("NFT data is missing", "NFT_DATA_MISSING");
    }

    if (!this.props.nftReward) {
      throw new DomainError(
        "NFT Reward data is missing",
        "NFT_REWARD_DATA_MISSING",
      );
    }

    return {
      ...this.props,
      nft: this.props.nft,
      nftReward: this.props.nftReward,
      nftRewardId: this.props.nftRewardId,
      userId: this.props.userId,
    };
  }
}
