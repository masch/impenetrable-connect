import { sign } from "hono/jwt";
import { users, refreshTokens } from "../db/schema";
import { eq } from "drizzle-orm";
import { LoginInput, User, UserRole } from "@repo/shared";
import { PasswordService } from "./password.service";
import { type Db } from "../db";
import { logger } from "./logger.service";

export class AuthService {
  static async login(input: LoginInput, db: Db, jwtSecret: string) {
    const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
    const REFRESH_TOKEN_EXPIRY_DAYS = 7;

    // 1. Find user by email or alias
    let user;
    if ("email" in input) {
      [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

      if (!user) {
        logger.warn(`Failed login attempt for email: ${input.email} (User not found)`);
        return null;
      }

      // 2. Verify password (Modern Unified Implementation)
      const isPasswordValid = await this.verifyPassword(input.password, user.passwordHash!);
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

    // 3. Generate Access Token
    const accessToken = await sign(
      {
        sub: user.id,
        role: user.role as UserRole,
        exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY,
      },
      jwtSecret,
      "HS256",
    );

    // 4. Generate Refresh Token
    const refreshTokenStr = crypto.randomUUID();
    const refreshTokenHash = await this.hashPassword(refreshTokenStr);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
    });

    // 5. Format user for response
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
