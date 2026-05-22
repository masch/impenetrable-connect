import { sign } from "hono/jwt";
import { users, refreshTokens } from "../db/schema";
import { eq } from "drizzle-orm";
import { LoginInput, CreateUserInput, User, UserRole } from "@repo/shared";
import { PasswordService } from "./password.service";
import { type Db } from "../db";
import { logger } from "./logger.service";

import { type UserSelect } from "../db/schema/users";

export class AuthService {
  private static readonly ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;

  static async login(input: LoginInput, db: Db, jwtSecret: string) {
    // 1. Find user by email or alias
    let user: UserSelect | undefined;
    if ("email" in input) {
      [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

      if (!user) {
        logger.warn(`Failed login attempt for email: ${input.email} (User not found)`);
        return null;
      }

      // 2. Verify password (Modern Unified Implementation)
      if (!user.passwordHash) {
        logger.warn(`Failed login attempt for email: ${input.email} (No password set)`);
        return null;
      }
      const isPasswordValid = await this.verifyPassword(input.password, user.passwordHash);
      if (!isPasswordValid) {
        logger.warn(`Failed login attempt for email: ${input.email} (Invalid password)`);
        return null;
      }
    } else {
      [user] = await db.select().from(users).where(eq(users.alias, input.alias)).limit(1);

      if (!user) {
        logger.warn(`Failed login attempt for alias: ${input.alias} (User not found)`);
        return null;
      }
      // Tourists don't have passwords in this version
    }

    return this.generateAuthResponse(user, db, jwtSecret);
  }

  static async createTourist(input: CreateUserInput, db: Db, jwtSecret: string) {
    // Check if alias already exists
    let existingUser: UserSelect | undefined;
    if (input.alias) {
      [existingUser] = await db.select().from(users).where(eq(users.alias, input.alias)).limit(1);
    }

    if (existingUser) {
      logger.info(`Existing tourist login for alias: ${input.alias}`);
      return this.generateAuthResponse(existingUser, db, jwtSecret);
    }

    // Create new tourist user
    const id = crypto.randomUUID();
    const [newUser] = await db
      .insert(users)
      .values({
        id,
        email: input.email, // null for tourists
        alias: input.alias,
        passwordHash: null,
        firstName: input.firstName,
        lastName: input.lastName,
        phoneNumber: input.phoneNumber,
        role: "TOURIST",
        isActive: true,
      })
      .returning();

    logger.info(`Created new tourist user: ${input.alias} (${id})`);
    return this.generateAuthResponse(newUser, db, jwtSecret);
  }

  private static async generateAuthResponse(user: UserSelect, db: Db, jwtSecret: string) {
    // Generate Access Token
    const accessToken = await sign(
      {
        sub: user.id,
        role: user.role as UserRole,
        exp: Math.floor(Date.now() / 1000) + this.ACCESS_TOKEN_EXPIRY,
      },
      jwtSecret,
      "HS256",
    );

    // Generate Refresh Token
    const refreshTokenStr = crypto.randomUUID();
    const refreshTokenHash = await this.hashPassword(refreshTokenStr);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
    });

    // Format user for response
    const safeUser: User = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      alias: user.alias,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      zzz_failed_login_attempts: user.zzz_failed_login_attempts,
      zzz_last_login_at: user.zzz_last_login_at,
      createdAt: user.zzzCreatedAt,
      updatedAt: user.zzzUpdatedAt,
    };

    return {
      accessToken,
      refreshToken: refreshTokenStr,
      user: safeUser,
    };
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return PasswordService.verify(password, hash);
  }

  static async hashPassword(password: string): Promise<string> {
    return PasswordService.hash(password);
  }
}
