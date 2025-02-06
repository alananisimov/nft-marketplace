import type { BaseEntity } from "../../../shared/domain/types";
import { DomainError } from "../../../shared/domain/errors";

interface TokenProps extends BaseEntity {
  userId: string;
  telegramId: number;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export class TokenEntity {
  private constructor(private props: TokenProps) {}

  static create(
    props: Omit<TokenProps, keyof BaseEntity> & Partial<BaseEntity>,
  ): TokenEntity {
    if (!props.userId || !props.accessToken || !props.refreshToken) {
      throw new DomainError(
        "User ID and tokens are required",
        "INVALID_TOKEN_DATA",
      );
    }

    return new TokenEntity({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      createdAt: props.createdAt ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get accessToken(): string {
    return this.props.accessToken;
  }

  get telegramId(): number {
    return this.props.telegramId;
  }

  get refreshToken(): string {
    return this.props.refreshToken;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get isExpired(): boolean {
    return this.props.expiresAt < new Date();
  }

  toDTO(): TokenProps {
    return { ...this.props };
  }
}
