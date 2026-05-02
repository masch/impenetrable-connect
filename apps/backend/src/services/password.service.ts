import { logger } from "./logger.service";

/**
 * Password Service (Native Web Crypto Implementation)
 * Provides high-performance, secure password hashing using PBKDF2.
 * Compatible with Bun, Cloudflare Workers, and modern browsers.
 */

const PBKDF2_ALGORITHM = "PBKDF2";
const PBKDF2_HASH_ALGO = "SHA-256";
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEY_LEN = 32;
const PBKDF2_SALT_LEN = 16;

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations = PBKDF2_ITERATIONS,
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: PBKDF2_ALGORITHM },
    false,
    ["deriveBits"],
  );

  return crypto.subtle.deriveBits(
    {
      name: PBKDF2_ALGORITHM,
      salt,
      iterations,
      hash: PBKDF2_HASH_ALGO,
    },
    baseKey,
    PBKDF2_KEY_LEN * 8,
  );
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

export const PasswordService = {
  /**
   * Hashes a password using PBKDF2.
   * Format: pbkdf2:iterations:salt:hash (hex encoded)
   */
  async hash(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_LEN));
    const hash = await deriveKey(password, salt);

    return `pbkdf2:${PBKDF2_ITERATIONS}:${toHex(salt)}:${toHex(new Uint8Array(hash))}`;
  },

  /**
   * Verifies a password against a PBKDF2 hash string.
   */
  async verify(password: string, storedHash: string): Promise<boolean> {
    try {
      if (!storedHash || typeof storedHash !== "string") return false;

      const [algo, iterationsStr, saltHex, hashHex] = storedHash.split(":");
      if (algo !== "pbkdf2" || !iterationsStr || !saltHex || !hashHex) return false;

      const iterations = parseInt(iterationsStr, 10);
      const salt = fromHex(saltHex);
      const expectedHash = fromHex(hashHex);

      const actualHash = await deriveKey(password, salt, iterations);

      return timingSafeEqual(expectedHash, new Uint8Array(actualHash));
    } catch (e) {
      logger.error("Password verification failed due to an internal error", {
        error: e instanceof Error ? e.message : String(e),
      });
      return false;
    }
  },
};
