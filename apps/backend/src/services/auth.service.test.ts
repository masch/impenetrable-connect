import { describe, expect, it } from "bun:test";
import { AuthService } from "./auth.service";
import { createDb } from "../db/index";

describe("AuthService Unit Tests", () => {
  const password = "my-secret-password";

  describe("hashPassword", () => {
    it("should generate a secure hash", async () => {
      const hash = await AuthService.hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith("pbkdf2:")).toBe(true);
    });

    it("should generate different hashes for the same password (salt)", async () => {
      const hash1 = await AuthService.hashPassword(password);
      const hash2 = await AuthService.hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should return true for correct password", async () => {
      const hash = await AuthService.hashPassword(password);
      const isValid = await AuthService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const hash = await AuthService.hashPassword(password);
      const isValid = await AuthService.verifyPassword("wrong-password", hash);
      expect(isValid).toBe(false);
    });

    it("should handle invalid hash formats gracefully (return false)", async () => {
      const isValid = await AuthService.verifyPassword(password, "not-a-hash");
      expect(isValid).toBe(false);
    });
  });

  describe("login", () => {
    const jwtSecret = "test-secret";
    const mockUser = {
      id: "1",
      email: "test@example.com",
      alias: "test-user",
      passwordHash: "hashed-pw",
      role: "admin",
      firstName: "Test",
      lastName: "User",
      isActive: true,
      zzz_failed_login_attempts: 0,
    };

    const createMockDb = (userResult: unknown) =>
      ({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve(userResult ? [userResult] : []),
            }),
          }),
        }),
        insert: () => ({
          values: () => Promise.resolve(),
        }),
      }) as unknown as ReturnType<typeof createDb>;

    it("should login successfully with email and password", async () => {
      const hash = await AuthService.hashPassword("password123");
      const db = createMockDb({ ...mockUser, passwordHash: hash });

      const result = await AuthService.login(
        { email: "test@example.com", password: "password123" },
        db,
        jwtSecret,
      );

      expect(result).not.toBeNull();
      expect(result?.accessToken).toBeDefined();
      expect(result?.user.email).toBe("test@example.com");
    });

    it("should return null if email user not found", async () => {
      const db = createMockDb(null);

      const result = await AuthService.login(
        { email: "ghost@example.com", password: "password123" },
        db,
        jwtSecret,
      );

      expect(result).toBeNull();
    });

    it("should return null for invalid password", async () => {
      const hash = await AuthService.hashPassword("correct-password");
      const db = createMockDb({ ...mockUser, passwordHash: hash });

      const result = await AuthService.login(
        { email: "test@example.com", password: "wrong-password" },
        db,
        jwtSecret,
      );

      expect(result).toBeNull();
    });

    it("should login successfully with alias (tourist)", async () => {
      const db = createMockDb(mockUser);

      const result = await AuthService.login({ alias: "tourist-123" }, db, jwtSecret);

      expect(result).not.toBeNull();
      expect(result?.user.id).toBe("1");
    });

    it("should return null if alias user not found", async () => {
      const db = createMockDb(null);

      const result = await AuthService.login({ alias: "unknown-alias" }, db, jwtSecret);

      expect(result).toBeNull();
    });
  });
});
