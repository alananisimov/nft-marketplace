import type { User } from "@acme/db/schema";

import type { BaseEntity } from "../../../shared/domain/types";
import { DomainError } from "../../../shared/domain/errors";

interface UserProps extends BaseEntity {
  telegramId: number;
  telegramHash: string;
  authorizedTgIds: number[];
  passwordHash: string;
  role: "user" | "admin";
  publicKey: string;
}

type UserFromDB = typeof User.$inferSelect;

export class UserEntity {
  private constructor(private props: UserProps) {}

  static create(
    props: Omit<UserProps, keyof BaseEntity> & Partial<BaseEntity>,
  ): UserEntity {
    if (!props.telegramId || !props.publicKey) {
      throw new DomainError(
        "Telegram ID and Public Key are required",
        "INVALID_USER_DATA",
      );
    }

    return new UserEntity({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      createdAt: props.createdAt ?? new Date(),
    });
  }

  static fromDB(data: UserFromDB): UserEntity {
    return UserEntity.create({
      id: data.id,
      role: data.role,
      telegramHash: data.tgHash,
      authorizedTgIds: data.authorizedTgIds,
      telegramId: data.telegramId,
      passwordHash: data.passwordHash,
      publicKey: data.publicKey,
      createdAt: new Date(data.createdAt),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get telegramId(): number {
    return this.props.telegramId;
  }


  get telegramHash(): string {
    return this.props.telegramHash;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get publicKey(): string {
    return this.props.publicKey;
  }

  get role(): "user" | "admin" {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get authorizedTgIds(): number[] {
    return this.props.authorizedTgIds;
  }

  addAuthorizedTgId(telegramId: number): void {
    if (!this.props.authorizedTgIds.includes(telegramId)) {
      this.props.authorizedTgIds.push(telegramId);
    }
  }

  removeAuthorizedTgId(telegramId: number): void {
    this.props.authorizedTgIds = this.props.authorizedTgIds.filter(
      (id) => id !== telegramId,
    );
  }

  toDTO(): UserProps {
    return { ...this.props };
  }
}
