import type { BaseEntity } from "../../../shared/domain/types";
import type {
  DeliveryResponse,
  DeliveryResponseWithNFT,
} from "../application/dto";
import type { DeliveryFromDB, DeliveryProps } from "./types";
import { DomainError } from "../../../shared/domain/errors";

type Status = "pending" | "processing" | "completed" | "failed";

export class DeliveryEntity {
  private constructor(private props: DeliveryProps) {}

  static create(
    props: Omit<DeliveryProps, keyof BaseEntity | "nft" | "status"> &
      Partial<
        BaseEntity & {
          status: Status;
        }
      >,
  ): DeliveryEntity {
    if (!props.address) {
      throw new DomainError("Address is required", "INVALID_ADDRESS");
    }

    return new DeliveryEntity({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      status: props.status ?? "pending",
      createdAt: props.createdAt ?? new Date(),
    });
  }

  static fromDB(data: DeliveryFromDB): DeliveryEntity {
    return new DeliveryEntity({
      id: data.id,
      nftId: data.nftId,
      userId: data.userId,
      status: data.status,
      nft: { ...data.nft, updatedAt: data.nft.updatedAt ?? undefined },
      address: data.address,
      lockDate: data.lockDate,
      ordered: new Date(data.ordered),
      processed: data.processed ? new Date(data.processed) : undefined,
      estimated: data.estimated ? new Date(data.estimated) : undefined,
      createdAt: data.ordered,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get nftId(): string {
    return this.props.nftId;
  }

  get address(): string {
    return this.props.address;
  }

  get lockDate(): number {
    return this.props.lockDate;
  }

  get status(): Status {
    return this.props.status;
  }

  get ordered(): Date {
    return this.props.ordered;
  }

  get userId(): string {
    return this.props.userId;
  }

  get processed(): Date | undefined {
    return this.props.processed;
  }

  get estimated(): Date | undefined {
    return this.props.estimated;
  }

  get createdAt(): Date {
    return this.createdAt;
  }

  toDTO(): DeliveryResponse | DeliveryResponseWithNFT {
    if (this.props.nft) {
      return {
        ...this.props,
        nft: this.props.nft,
      } as DeliveryResponseWithNFT;
    }

    return {
      ...this.props,
    } as DeliveryResponse;
  }
  toDTOWithNFT(): DeliveryResponseWithNFT {
    if (!this.props.nft) {
      throw new DomainError("NFT data is missing", "NFT_DATA_MISSING");
    }

    return {
      ...this.props,
      nft: this.props.nft,
    };
  }
}
