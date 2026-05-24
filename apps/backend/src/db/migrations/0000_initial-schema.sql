CREATE TYPE "impenetrable_connect"."user_role" AS ENUM('ADMIN', 'ENTREPRENEUR', 'TOURIST');--> statement-breakpoint
CREATE TABLE "impenetrable_connect"."projects" (
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
CREATE TABLE "impenetrable_connect"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255),
	"alias" varchar(50),
	"password_hash" varchar(255),
	"first_name" varchar(100),
	"last_name" varchar(100),
	"phone_number" varchar(20),
	"role" "impenetrable_connect"."user_role" DEFAULT 'ENTREPRENEUR' NOT NULL,
	"zzz_failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"zzz_last_login_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"zzz_created_at" timestamp DEFAULT now() NOT NULL,
	"zzz_updated_at" timestamp DEFAULT now() NOT NULL,
	"zzz_deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_alias_unique" UNIQUE("alias")
);
--> statement-breakpoint
CREATE TABLE "impenetrable_connect"."ventures" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_id" uuid NOT NULL,
	"zzz_project_id" integer NOT NULL,
	"zzz_max_capacity" integer DEFAULT 0 NOT NULL,
	"zzz_cascade_order" integer DEFAULT 0 NOT NULL,
	"zzz_is_paused" boolean DEFAULT false NOT NULL,
	"zzz_is_active" boolean DEFAULT true NOT NULL,
	"zzz_created_at" timestamp DEFAULT now() NOT NULL,
	"zzz_updated_at" timestamp DEFAULT now() NOT NULL,
	"zzz_deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "impenetrable_connect"."refresh_tokens" (
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
CREATE TABLE "impenetrable_connect"."venture_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"venture_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(50) DEFAULT 'MANAGER' NOT NULL,
	"zzz_created_at" timestamp DEFAULT now() NOT NULL,
	"zzz_updated_at" timestamp DEFAULT now() NOT NULL,
	"zzz_deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "impenetrable_connect"."product_categories" (
	"zzz_id" serial PRIMARY KEY NOT NULL,
	"zzz_project_id" integer NOT NULL,
	"zzz_name_i18n" jsonb NOT NULL,
	"zzz_description_i18n" jsonb,
	"zzz_is_active" boolean DEFAULT true NOT NULL,
	"zzz_created_at" timestamp DEFAULT now() NOT NULL,
	"zzz_updated_at" timestamp DEFAULT now() NOT NULL,
	"zzz_deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "impenetrable_connect"."products" (
	"zzz_id" serial PRIMARY KEY NOT NULL,
	"zzz_product_category_id" integer NOT NULL,
	"zzz_name_i18n" jsonb NOT NULL,
	"zzz_description_i18n" jsonb,
	"zzz_price" numeric(10, 2) NOT NULL,
	"zzz_max_participants" integer NOT NULL,
	"zzz_image_url" varchar(500),
	"zzz_global_pause" boolean DEFAULT false NOT NULL,
	"zzz_service_moments" jsonb,
	"zzz_created_at" timestamp DEFAULT now() NOT NULL,
	"zzz_updated_at" timestamp DEFAULT now() NOT NULL,
	"zzz_deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "impenetrable_connect"."ventures" ADD CONSTRAINT "ventures_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "impenetrable_connect"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impenetrable_connect"."ventures" ADD CONSTRAINT "ventures_zzz_project_id_projects_zzz_id_fk" FOREIGN KEY ("zzz_project_id") REFERENCES "impenetrable_connect"."projects"("zzz_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impenetrable_connect"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "impenetrable_connect"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impenetrable_connect"."venture_members" ADD CONSTRAINT "venture_members_venture_id_ventures_id_fk" FOREIGN KEY ("venture_id") REFERENCES "impenetrable_connect"."ventures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impenetrable_connect"."venture_members" ADD CONSTRAINT "venture_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "impenetrable_connect"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impenetrable_connect"."product_categories" ADD CONSTRAINT "product_categories_zzz_project_id_projects_zzz_id_fk" FOREIGN KEY ("zzz_project_id") REFERENCES "impenetrable_connect"."projects"("zzz_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impenetrable_connect"."products" ADD CONSTRAINT "products_zzz_product_category_id_product_categories_zzz_id_fk" FOREIGN KEY ("zzz_product_category_id") REFERENCES "impenetrable_connect"."product_categories"("zzz_id") ON DELETE no action ON UPDATE no action;