import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number
) => Promise<Buffer>;

// scrypt is in Node's standard library, so this needs no native module and no
// build step. N=2^15 with r=8 costs ~50-100ms per hash on a small server, which
// is the point: it makes offline guessing expensive.
const KEYLEN = 64;
const SALT_BYTES = 16;

/** Serialised as `scrypt$N$r$p$salt$key`, all binary parts base64. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await scrypt(normalize(password), salt, KEYLEN);
  return ["scrypt", "32768", "8", "1", salt.toString("base64"), key.toString("base64")].join("$");
}

/**
 * Constant-time verification. Returns false rather than throwing on a malformed
 * or absent hash, so a user row without a password (an OAuth account) simply
 * fails password login instead of erroring.
 */
export async function verifyPassword(
  password: string,
  storedHash: string | null | undefined
): Promise<boolean> {
  if (!storedHash) return false;

  const parts = storedHash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, , , , saltB64, keyB64] = parts;
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltB64, "base64");
    expected = Buffer.from(keyB64, "base64");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;

  let actual: Buffer;
  try {
    actual = await scrypt(normalize(password), salt, expected.length);
  } catch {
    return false;
  }

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * Unicode-normalise so a password typed with a different but canonically
 * equivalent encoding (common with Arabic and accented input) still matches.
 */
function normalize(password: string): string {
  return password.normalize("NFKC");
}
