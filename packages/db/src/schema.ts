import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const rolesEnum = pgEnum("roles", ["user", "admin"]);

export const verificationPurposeEnum = pgEnum("verification_purpose", [
  "new_telegram_id",
  "verification",
]);

export const Collection = pgTable("collection", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 255 }).notNull(),
  description: t.varchar({ length: 1024 }).notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const NFT = pgTable(
  "nft",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    assetCode: t.varchar({ length: 64 }).notNull(),
    image: t.text().notNull(),
    description: t.text().notNull(),
    name: t.varchar({ length: 255 }).notNull(),
    lockupPeriod: t.integer().notNull(),
    domain: t.varchar({ length: 255 }).notNull(),
    code: t.varchar({ length: 100 }).notNull(),
    issuerPubkey: t.varchar({ length: 56 }).notNull(),
    issuerPrivatekey: t.varchar({ length: 56 }).notNull(),
    distribPubkey: t.varchar({ length: 56 }).notNull(),
    distribPrivatekey: t.varchar({ length: 56 }).notNull(),
    collectionId: t
      .uuid()
      .notNull()
      .references(() => Collection.id, { onDelete: "cascade" }),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t
      .timestamp({ mode: "date", withTimezone: true })
      .$onUpdateFn(() => sql`now()`),
  }),
  (table) => {
    return {
      collectionIdIdx: index("collection_id_idx").on(table.collectionId),
    };
  },
);

export const User = pgTable(
  "user",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    telegramId: t
      .bigint({
        mode: "number",
      })
      .notNull()
      .unique(),
    role: rolesEnum().default("user").notNull(),
    passwordHash: t.varchar().notNull(),
    publicKey: t.varchar({ length: 56 }).notNull(),
    authorizedTgIds: t
      .bigint({
        mode: "number",
      })
      .array()
      .notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
    metadata: t.jsonb(),
  }),
  (table) => {
    return {
      telegramIdIdx: uniqueIndex("telegram_id_idx").on(table.telegramId),
      publicKeyIdx: index("public_key_idx").on(table.publicKey),
    };
  },
);

export const Reward = pgTable("reward", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 100 }).notNull(),
  issuer: t.varchar({ length: 1000 }).notNull(),
  image: t.varchar().notNull(),
  symbol: t.varchar({ length: 10 }).notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  metadata: t.jsonb(),
}));

export const StakingItem = pgTable(
  "staking_item",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    nftId: t
      .uuid()
      .notNull()
      .references(() => NFT.id, { onDelete: "cascade" }),
    nftRewardId: t
      .uuid()
      .notNull()
      .references(() => NFTReward.id, { onDelete: "cascade" }),
    userId: t
      .uuid()
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    earned: t.integer().default(0).notNull(),
    lockupPeriod: t.timestamp({ mode: "date", withTimezone: true }).notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
    metadata: t.jsonb(),
  }),
  (table) => {
    return {
      userIdIdx: index("user_id_idx").on(table.userId),
      nftIdIdx: index("nft_id_idx").on(table.nftId),
      nftRewardIdIdx: index("nft_reward_id_idx").on(table.nftRewardId),
    };
  },
);

export const DeliveryItem = pgTable(
  "delivery_item",
  {
    id: uuid().notNull().primaryKey().defaultRandom(),
    nftId: uuid()
      .notNull()
      .references(() => NFT.id, { onDelete: "cascade" }),
    address: text().notNull(),
    lockDate: integer().notNull(),
    status: deliveryStatusEnum().default("pending").notNull(),
    ordered: timestamp().defaultNow().notNull(),
    userId: uuid()
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    processed: timestamp({ mode: "date", withTimezone: true }),
    estimated: timestamp({ mode: "date", withTimezone: true }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(
      () => sql`now()`,
    ),
    metadata: jsonb(),
  },
  (table) => {
    return {
      nftStatusIdx: index("nft_status_idx").on(table.nftId, table.status),
      userIdIdx: index("delivery_user_id_idx").on(table.userId),
    };
  },
);

export const Verification = pgTable(
  "verification",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    userId: t
      .uuid()
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    walletAddress: t.varchar({ length: 255 }).notNull(),
    memo: t.varchar({ length: 255 }).notNull().unique(),
    purpose: verificationPurposeEnum().default("verification"),
    isVerified: t.boolean().default(false),
    createdAt: t.timestamp().defaultNow().notNull(),
    expiresAt: t.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (table) => {
    return {
      expiresAtIdx: index("expires_at_idx").on(table.expiresAt),
    };
  },
);

export const NFTReward = pgTable(
  "nft_reward",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    nftId: t
      .uuid()
      .notNull()
      .references(() => NFT.id, { onDelete: "cascade" }),
    rewardId: t
      .uuid()
      .notNull()
      .references(() => Reward.id, { onDelete: "cascade" }),
    monthlyPercentage: t.integer().notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t
      .timestamp({ mode: "date", withTimezone: true })
      .$onUpdateFn(() => sql`now()`),
    metadata: t.jsonb(),
  }),
  (table) => {
    return {
      nftIdIdx: index("nft_reward_nft_id_idx").on(table.nftId),
      rewardIdIdx: index("nft_reward_reward_id_idx").on(table.rewardId),
    };
  },
);

export const CollectionRelations = relations(Collection, ({ many }) => ({
  nfts: many(NFT),
}));

export const UserRelations = relations(User, ({ many }) => ({
  verifications: many(Verification),
  stakingItems: many(StakingItem),
  deliveryItems: many(DeliveryItem),
}));

export const DeliveryRelation = relations(DeliveryItem, ({ one }) => ({
  nft: one(NFT, {
    fields: [DeliveryItem.nftId],
    references: [NFT.id],
  }),
  user: one(User, {
    fields: [DeliveryItem.userId],
    references: [User.id],
  }),
}));

export const RewardRelations = relations(Reward, ({ many }) => ({
  nftRewards: many(NFTReward),
}));

export const NFTRewardRelations = relations(NFTReward, ({ one }) => ({
  nft: one(NFT, {
    fields: [NFTReward.nftId],
    references: [NFT.id],
  }),
  reward: one(Reward, {
    fields: [NFTReward.rewardId],
    references: [Reward.id],
  }),
}));

export const VerificationRelations = relations(Verification, ({ one }) => ({
  user: one(User, {
    fields: [Verification.userId],
    references: [User.id],
  }),
}));

export const NFTRelations = relations(NFT, ({ one, many }) => ({
  collection: one(Collection, {
    fields: [NFT.collectionId],
    references: [Collection.id],
  }),
  stakingItems: many(StakingItem),
  deliveryItems: many(DeliveryItem),
  nftRewards: many(NFTReward),
}));

export const StakingItemRelations = relations(StakingItem, ({ one }) => ({
  nft: one(NFT, {
    fields: [StakingItem.nftId],
    references: [NFT.id],
  }),
  nftReward: one(NFTReward, {
    fields: [StakingItem.nftRewardId],
    references: [NFTReward.id],
  }),
  user: one(User, {
    fields: [StakingItem.userId],
    references: [User.id],
  }),
}));

export const CreateCollectionSchema = createInsertSchema(Collection, {
  name: z.string().min(1).max(255),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateNFTSchema = createInsertSchema(NFT, {
  assetCode: z.string().max(64),
  name: z.string().max(255),
  description: z.string(),
  image: z.string(),
  lockupPeriod: z.number().positive(),
  domain: z.string().max(255),
  code: z.string().max(100),
  collectionId: z.string().uuid(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  issuerPubkey: true,
  issuerPrivatekey: true,
  distribPubkey: true,
  distribPrivatekey: true,
});

export const CreateRewardSchema = createInsertSchema(Reward, {
  name: z.string().max(100),
  image: z.string().min(1),
  issuer: z.string().max(1000),
  symbol: z.string().max(10),
}).omit({
  id: true,
  createdAt: true,
});

export const CreateStakingItemSchema = createInsertSchema(StakingItem, {
  nftId: z.string().uuid(),
  nftRewardId: z.string().uuid(),
  lockupPeriod: z.date(),
}).omit({
  id: true,
  createdAt: true,
});

export const CreateDeliveryItemSchema = createInsertSchema(DeliveryItem, {
  nftId: z.string().uuid(),
  address: z.string(),
  lockDate: z.number(),
}).omit({
  id: true,
  ordered: true,
  processed: true,
  estimated: true,
});

export const CreateVerificationSchema = createInsertSchema(Verification, {
  userId: z.string().uuid(),
  walletAddress: z.string().length(56),
  memo: z.string().max(50),
  expiresAt: z.date(),
}).omit({
  id: true,
  isVerified: true,
  createdAt: true,
});
