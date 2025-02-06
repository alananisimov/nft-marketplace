CREATE TYPE "public"."delivery_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."roles" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "delivery_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nft_id" uuid NOT NULL,
	"address" text NOT NULL,
	"lock_date" integer NOT NULL,
	"status" "delivery_status" DEFAULT 'pending' NOT NULL,
	"ordered" timestamp DEFAULT now() NOT NULL,
	"processed" timestamp with time zone,
	"estimated" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_code" varchar(64) NOT NULL,
	"image" text NOT NULL,
	"description" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"lockup_period" integer NOT NULL,
	"domain" varchar(255) NOT NULL,
	"code" varchar(100) NOT NULL,
	"issuer_pubkey" varchar(56) NOT NULL,
	"issuer_privatekey" varchar(56) NOT NULL,
	"distrib_pubkey" varchar(56) NOT NULL,
	"distrib_privatekey" varchar(56) NOT NULL,
	"collection_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nft_reward" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nft_id" uuid NOT NULL,
	"reward_id" uuid NOT NULL,
	"percentage" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reward" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"issuer" varchar(1000) NOT NULL,
	"image" varchar NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staking_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nft_id" uuid NOT NULL,
	"nft_reward_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"lockup_period" timestamp with time zone NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telegram_id" integer NOT NULL,
	"role" "roles" DEFAULT 'user' NOT NULL,
	"password_hash" varchar NOT NULL,
	"public_key" varchar(56) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_telegramId_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_address" varchar(255) NOT NULL,
	"memo" varchar(255) NOT NULL,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_memo_unique" UNIQUE("memo")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "delivery_item" ADD CONSTRAINT "delivery_item_nft_id_nft_id_fk" FOREIGN KEY ("nft_id") REFERENCES "public"."nft"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nft" ADD CONSTRAINT "nft_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nft_reward" ADD CONSTRAINT "nft_reward_nft_id_nft_id_fk" FOREIGN KEY ("nft_id") REFERENCES "public"."nft"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nft_reward" ADD CONSTRAINT "nft_reward_reward_id_reward_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."reward"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staking_item" ADD CONSTRAINT "staking_item_nft_id_nft_id_fk" FOREIGN KEY ("nft_id") REFERENCES "public"."nft"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staking_item" ADD CONSTRAINT "staking_item_nft_reward_id_nft_reward_id_fk" FOREIGN KEY ("nft_reward_id") REFERENCES "public"."nft_reward"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staking_item" ADD CONSTRAINT "staking_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verification" ADD CONSTRAINT "verification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nft_status_idx" ON "delivery_item" USING btree ("nft_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collection_id_idx" ON "nft" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nft_reward_nft_id_idx" ON "nft_reward" USING btree ("nft_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nft_reward_reward_id_idx" ON "nft_reward" USING btree ("reward_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "staking_item" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nft_id_idx" ON "staking_item" USING btree ("nft_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nft_reward_id_idx" ON "staking_item" USING btree ("nft_reward_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "telegram_id_idx" ON "user" USING btree ("telegram_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "public_key_idx" ON "user" USING btree ("public_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "expires_at_idx" ON "verification" USING btree ("expires_at");