import { sign } from "hono/jwt";
import { db } from "../db";
import { users, refreshTokens } from "../db/schema";
import { eq } from "drizzle-orm";
import { LoginInput, User } from "@repo/shared";
import { logger } from "./logger.service";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-dev-key";
const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export class AuthService {
  static async login(input: LoginInput) {
    // 1. Find user by email or alias
    let user;
    if ("email" in input) {
      [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

      if (!user) {
        logger.warn(`Failed login attempt for email: ${input.email} (User not found)`);
        return null;
      }

      // 2. Verify password
      const isPasswordValid = await Bun.password.verify(input.password, user.passwordHash!);
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
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY,
      },
      JWT_SECRET,
      "HS256",
    );

    // 4. Generate Refresh Token
    const refreshTokenStr = crypto.randomUUID();
    const refreshTokenHash = await Bun.password.hash(refreshTokenStr);

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
      role: user.role,
      alias: user.alias,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      zzz_failed_login_attempts: user.zzz_failed_login_attempts,
      zzz_last_login_at: user.zzz_last_login_at,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      accessToken,
      refreshToken: refreshTokenStr,
      user: safeUser,
    };
  }

  static async hashPassword(password: string) {
    return Bun.password.hash(password, {
      algorithm: "argon2id",
      memoryCost: 65536,
      timeCost: 2,
    });
  }
}
