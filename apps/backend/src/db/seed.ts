import { db } from "./index";
import { projects, users, ventures } from "./schema";
import { sql } from "drizzle-orm";
import { MOCK_PROJECTS, MOCK_USERS, MOCK_VENTURES } from "@repo/shared";
import { logger } from "../services/logger.service";
import { AuthService } from "../services/auth.service";

async function seed() {
  logger.info("🌱 Seeding database...");

  // 1. Projects
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
  await db.execute(sql`SELECT setval('projects_zzz_id_seq', (SELECT MAX(zzz_id) FROM projects))`);

  // 2. Users
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

  // 3. Ventures
  logger.info("   - Seeding ventures...");
  const usersResult = await db.select().from(users);
  const maria = usersResult.find((u) => u.email === "maria@forst-stew.com");

  if (maria) {
    const venturesToInsert = MOCK_VENTURES.map((v) => ({
      id: v.id,
      name: v.name,
      ownerId: maria.id,
      zzz_max_capacity: v.zzz_max_capacity,
      zzz_cascade_order: v.zzz_cascade_order,
      zzz_is_paused: v.zzz_is_paused,
      zzz_is_active: v.zzz_is_active,
    }));

    await db.insert(ventures).values(venturesToInsert).onConflictDoNothing();
  }

  logger.info("✅ Seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  logger.error("❌ Seeding failed!", err);
  process.exit(1);
});
