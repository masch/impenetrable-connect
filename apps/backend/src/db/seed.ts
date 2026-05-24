import { sql, eq } from "drizzle-orm";
import { createDb, type Db } from "./index";
import { projects, users, ventures, productCategories, products, SCHEMA_NAME } from "./schema";
import {
  MOCK_PROJECTS,
  MOCK_USERS,
  MOCK_VENTURES,
  MOCK_PRODUCT_CATEGORIES,
  MOCK_PRODUCTS,
} from "@repo/shared";
import { logger } from "../services/logger.service";
import { AuthService } from "../services/auth.service";
import { getAppConfig } from "../config/env";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resets the sequence for a table to the current max id in custom schema. */
async function resetSequence(db: Db, table: string, pkColumn: string) {
  const seqName = `"${SCHEMA_NAME}"."${table}_${pkColumn}_seq"`;
  await db.execute(
    sql`SELECT setval(${seqName}, (SELECT MAX(${sql.identifier(pkColumn)}) FROM ${sql.identifier(SCHEMA_NAME)}.${sql.identifier(table)}))`,
  );
}

// ---------------------------------------------------------------------------
// Seed sections
// ---------------------------------------------------------------------------

async function seedProjects(db: Db) {
  logger.info("   - Seeding projects...");

  for (const project of MOCK_PROJECTS) {
    await db
      .insert(projects)
      .values({
        zzz_id: project.zzz_id,
        zzz_name: project.zzz_name,
        zzz_default_language: project.zzz_default_language,
        zzz_supported_languages: project.zzz_supported_languages,
        zzz_cascade_timeout_minutes: project.zzz_cascade_timeout_minutes,
        zzz_max_cascade_attempts: project.zzz_max_cascade_attempts,
        zzz_is_active: project.zzz_is_active,
      })
      .onConflictDoUpdate({
        target: projects.zzz_id,
        set: {
          zzz_name: project.zzz_name,
          zzz_default_language: project.zzz_default_language,
          zzz_supported_languages: project.zzz_supported_languages,
          zzz_cascade_timeout_minutes: project.zzz_cascade_timeout_minutes,
          zzz_max_cascade_attempts: project.zzz_max_cascade_attempts,
          zzz_is_active: project.zzz_is_active,
        },
      });
  }

  await resetSequence(db, "projects", "zzz_id");
}

async function seedUsers(db: Db) {
  logger.info("   - Seeding users...");

  const defaultPassword = await AuthService.hashPassword("password123");
  const usersToInsert = MOCK_USERS.map((u) => ({
    email: u.email,
    alias: u.alias,
    passwordHash: u.role === "TOURIST" ? null : defaultPassword,
    role: u.role as "ADMIN" | "ENTREPRENEUR" | "TOURIST",
    firstName: u.firstName,
    lastName: u.lastName,
    phoneNumber: u.phoneNumber,
    isActive: u.isActive,
  }));

  await db.insert(users).values(usersToInsert).onConflictDoNothing();
}

async function seedVentures(db: Db) {
  logger.info("   - Seeding ventures...");

  const [maria] = await db
    .select()
    .from(users)
    .where(eq(users.email, "maria@forst-stew.com"))
    .limit(1);

  if (!maria) {
    logger.warn("   - Skipping ventures: maria@forst-stew.com not found");
    return;
  }

  const venturesToInsert = MOCK_VENTURES.map((v) => ({
    id: v.id,
    name: v.name,
    ownerId: maria.id,
    zzz_project_id: v.zzz_project_id,
    zzz_max_capacity: v.zzz_max_capacity,
    zzz_cascade_order: v.zzz_cascade_order,
    zzz_is_paused: v.zzz_is_paused,
    zzz_is_active: v.zzz_is_active,
  }));

  await db.insert(ventures).values(venturesToInsert).onConflictDoNothing();
}

async function seedProductCategories(db: Db) {
  logger.info("   - Seeding product categories...");

  for (const cat of MOCK_PRODUCT_CATEGORIES) {
    const catValues = {
      zzz_id: cat.zzz_id,
      zzz_project_id: cat.zzz_project_id,
      zzz_name_i18n: cat.zzz_name_i18n,
      zzz_description_i18n: cat.zzz_description_i18n ?? null,
      zzz_is_active: cat.zzz_is_active,
    };

    await db.insert(productCategories).values(catValues).onConflictDoUpdate({
      target: productCategories.zzz_id,
      set: catValues,
    });
  }

  await resetSequence(db, "product_categories", "zzz_id");
}

async function seedProducts(db: Db) {
  logger.info("   - Seeding products...");

  const productRows = MOCK_PRODUCTS.map((item) => ({
    ...item,
    zzz_image_url: item.zzz_image_url != null ? String(item.zzz_image_url) : null,
  }));

  for (const row of productRows) {
    await db.insert(products).values(row).onConflictDoUpdate({
      target: products.zzz_id,
      set: row,
    });
  }

  await resetSequence(db, "products", "zzz_id");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seed() {
  logger.info("🌱 Seeding database...");

  try {
    const config = getAppConfig();
    const db = createDb(config.databaseUrl);

    await seedProjects(db);
    await seedUsers(db);
    await seedVentures(db);
    await seedProductCategories(db);
    await seedProducts(db);

    logger.info("✅ Seeding completed!");
    process.exit(0);
  } catch (err) {
    logger.error("❌ Seeding failed!", err);
    process.exit(1);
  }
}

seed();
