import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("accepts the correct password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("Correct horse battery staple", hash)).toBe(false);
    expect(await verifyPassword("", hash)).toBe(false);
    expect(await verifyPassword("correct horse battery stapl", hash)).toBe(false);
  });

  it("never stores the password in the hash", async () => {
    const hash = await hashPassword("hunter2");
    expect(hash).not.toContain("hunter2");
  });

  it("salts, so the same password hashes differently every time", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    expect(a).not.toBe(b);
    // ...and both still verify
    expect(await verifyPassword("same-password", a)).toBe(true);
    expect(await verifyPassword("same-password", b)).toBe(true);
  });

  it("fails closed for accounts with no password (OAuth users)", async () => {
    expect(await verifyPassword("anything", null)).toBe(false);
    expect(await verifyPassword("anything", undefined)).toBe(false);
    expect(await verifyPassword("", null)).toBe(false);
  });

  it("fails closed on malformed hashes instead of throwing", async () => {
    for (const bad of [
      "",
      "not-a-hash",
      "scrypt$32768$8$1$onlyfiveparts",
      "bcrypt$32768$8$1$c2FsdA==$a2V5",
      "scrypt$32768$8$1$$",
      "$$$$$",
    ]) {
      expect(await verifyPassword("anything", bad)).toBe(false);
    }
  });

  it("handles unicode and long passwords", async () => {
    const arabic = "كلمة-سر-قوية-جدا";
    const hash = await hashPassword(arabic);
    expect(await verifyPassword(arabic, hash)).toBe(true);
    expect(await verifyPassword("كلمة-سر-قوية-جد", hash)).toBe(false);

    const long = "x".repeat(500);
    const longHash = await hashPassword(long);
    expect(await verifyPassword(long, longHash)).toBe(true);
  });

  it("treats canonically equivalent unicode as the same password", async () => {
    // U+00E9 vs e + U+0301 - the same character, different encodings.
    const composed = "café-pass";
    const decomposed = "café-pass";
    expect(composed).not.toBe(decomposed);
    const hash = await hashPassword(composed);
    expect(await verifyPassword(decomposed, hash)).toBe(true);
  });
});
