import type { BaseEntity } from "../../../shared/domain/types";
import { DomainError } from "../../../shared/domain/errors";
import { randomString } from "../../../utils/random";

interface VerificationProps extends BaseEntity {
  userId: string;
  walletAddress: string;
  memo: string;
  purpose: "verification" | "new_telegram_id";
  isVerified: boolean;
  expiresAt: Date;
}

export class VerificationEntity {
  private constructor(private props: VerificationProps) {}

  static create(
    props: Omit<
      VerificationProps,
      keyof BaseEntity | "isVerified" | "expiresAt" | "memo" | "purpose"
    > &
      Partial<
        BaseEntity & {
          memo: string;
          purpose?: "verification" | "new_telegram_id";
        }
      >,
  ): VerificationEntity {
    if (!props.userId || !props.walletAddress) {
      throw new DomainError(
        "User ID and wallet address are required",
        "INVALID_VERIFICATION_DATA",
      );
    }

    return new VerificationEntity({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      memo: props.memo ?? randomString(12),
      purpose: props.purpose ?? "verification",
      isVerified: false,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes
      createdAt: props.createdAt ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get walletAddress(): string {
    return this.props.walletAddress;
  }

  get memo(): string {
    return this.props.memo;
  }

  get isVerified(): boolean {
    return this.props.isVerified;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get isExpired(): boolean {
    return this.props.expiresAt < new Date();
  }

  get purpose(): "verification" | "new_telegram_id" {
    return this.props.purpose;
  }

  verify(): void {
    this.props.isVerified = true;
  }

  toDTO() {
    return {
      id: this.id,
      walletAddress: this.walletAddress,
      memo: this.memo,
      expiresAt: this.expiresAt,
    };
  }
}
