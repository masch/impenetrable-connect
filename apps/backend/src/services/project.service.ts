import { desc, eq } from "drizzle-orm";
import { type Db } from "../db";
import { projects } from "../db/schema";
import { type CreateProjectInput } from "@repo/shared";

export class ProjectService {
  /**
   * Returns all projects ordered by active status (desc) then name (asc).
   */
  static async getAll(db: Db) {
    return db.select().from(projects).orderBy(desc(projects.zzz_is_active), projects.zzz_name);
  }

  /**
   * Returns a single project by ID, or undefined if not found.
   */
  static async getById(db: Db, id: number) {
    const [project] = await db.select().from(projects).where(eq(projects.zzz_id, id)).limit(1);
    return project;
  }

  /**
   * Returns the first active project or undefined.
   */
  static async getFirstActive(db: Db) {
    const [activeProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.zzz_is_active, true))
      .orderBy(projects.zzz_id)
      .limit(1);
    return activeProject;
  }

  /**
   * Creates a new project and returns the created record.
   */
  static async create(db: Db, input: CreateProjectInput) {
    const [newProject] = await db.insert(projects).values(input).returning();
    return newProject;
  }
}
