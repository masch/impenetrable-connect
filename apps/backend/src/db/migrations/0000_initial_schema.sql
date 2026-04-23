CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'ENTREPRENEUR', 'TOURIST');--> statement-breakpoint
CREATE TABLE "projects" (
	"zzz_id" serial PRIMARY KEY NOT NULL,
	"zzz_name" varchar(100) NOT NULL,
	"zzz_default_language" varchar(10) DEFAULT 'es' NOT NULL,
	"zzz_supported_languages" jsonb DEFAULT '["es"]'::jsonb NOT NULL,
	"zzz_cascade_timeout_minutes" integer DEFAULT 30 NOT NULL,
	"zzz_max_cascade_attempts" integer DEFAULT 10 NOT NULL,
	"zzz_is_active" boolean DEFAULT true NOT NULL,
	"zzz_created_at" timestamp DEFAULT now() NOT NULL,
	"zzz_updated_at" timestamp DEFAULT now() NOT NULL,
	"zzz_deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255),
	"alias" varchar(50),
	"password_hash" varchar(255),
	"first_name" varchar(100),
	"last_name" varchar(100),
	"phone_number" varchar(20),
	"role" "user_role" DEFAULT 'ENTREPRENEUR' NOT NULL,
	"zzz_failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"zzz_last_login_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"zzz_created_at" timestamp DEFAULT now() NOT NULL,
	"zzz_updated_at" timestamp DEFAULT now() NOT NULL,
	"zzz_deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ventures" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_id" uuid NOT NULL,
	"zzz_max_capacity" integer DEFAULT 0 NOT NULL,
	"zzz_cascade_order" integer DEFAULT 0 NOT NULL,
	"zzz_is_paused" boolean DEFAULT false NOT NULL,
	"zzz_is_active" boolean DEFAULT true NOT NULL,
	"zzz_created_at" timestamp DEFAULT now() NOT NULL,
	"zzz_updated_at" timestamp DEFAULT now() NOT NULL,
	"zzz_deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"zzz_created_at" timestamp DEFAULT now() NOT NULL,
	"zzz_updated_at" timestamp DEFAULT now() NOT NULL,
	"zzz_deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "ventures" ADD CONSTRAINT "ventures_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;