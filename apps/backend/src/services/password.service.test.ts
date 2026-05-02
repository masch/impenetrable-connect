import { describe, expect, it, spyOn } from "bun:test";
import { PasswordService } from "./password.service";
import { logger } from "./logger.service";

describe("PasswordService Unit Tests", () => {
  const password = "my-secure-password";

  it("should hash and verify a password correctly", async () => {
    const hash = await PasswordService.hash(password);
    expect(hash.startsWith("pbkdf2:")).toBe(true);

    const isValid = await PasswordService.verify(password, hash);
    expect(isValid).toBe(true);
  });

  it("should return false for incorrect password", async () => {
    const hash = await PasswordService.hash(password);
    const isValid = await PasswordService.verify("wrong-password", hash);
    expect(isValid).toBe(false);
  });

  it("should generate different hashes for the same password due to random salt", async () => {
    const hash1 = await PasswordService.hash(password);
    const hash2 = await PasswordService.hash(password);
    expect(hash1).not.toBe(hash2);
  });

  describe("Edge Cases & Error Handling", () => {
    it("should return false for hash with wrong algorithm prefix", async () => {
      const hash = await PasswordService.hash(password);
      const wrongAlgoHash = hash.replace("pbkdf2", "argon2");
      const isValid = await PasswordService.verify(password, wrongAlgoHash);
      expect(isValid).toBe(false);
    });

    it("should return false for malformed hash strings", async () => {
      expect(await PasswordService.verify(password, "invalid")).toBe(false);
      expect(await PasswordService.verify(password, "pbkdf2:10000:salt")).toBe(false);
    });

    it("should return false if salt or hash is not valid hex (triggers catch)", async () => {
      const invalidHexHash = `pbkdf2:100000:nothex:deadbeef`;
      const isValid = await PasswordService.verify(password, invalidHexHash);
      expect(isValid).toBe(false);
    });

    it("should handle empty passwords", async () => {
      const hash = await PasswordService.hash("");
      expect(await PasswordService.verify("", hash)).toBe(true);
      expect(await PasswordService.verify("not-empty", hash)).toBe(false);
    });

    it("should handle timingSafeEqual with different length buffers", async () => {
      // This indirectly tests the private timingSafeEqual branch for length mismatch
      const hash = await PasswordService.hash(password);
      const parts = hash.split(":");
      // Shorten the hash part
      parts[3] = parts[3].substring(0, 10);
      const shortHash = parts.join(":");

      const isValid = await PasswordService.verify(password, shortHash);
      expect(isValid).toBe(false);
    });

    it("should fail gracefully on totally garbage input", async () => {
      // @ts-ignore - testing runtime robustness
      expect(await PasswordService.verify(null, null)).toBe(false);
      // @ts-ignore
      expect(await PasswordService.verify(undefined, "pbkdf2:100:1:1")).toBe(false);
    });

    it("should trigger catch block on internal error (e.g. invalid iteration count)", async () => {
      const loggerSpy = spyOn(logger, "error");

      // Very large iteration count that causes an error in Bun's crypto
      const crazyHash = `pbkdf2:-1:73616c74:68617368`;
      const isValid = await PasswordService.verify(password, crazyHash);

      expect(isValid).toBe(false);
      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy.mock.calls[0][0]).toContain("Password verification failed");

      loggerSpy.mockRestore();
    });
  });
});
