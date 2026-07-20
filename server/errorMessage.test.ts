import { describe, expect, it } from "vitest";
// Shared client helper; tested here because vitest is configured for server/**.
import { readableError } from "../client/src/lib/errorMessage";

describe("readableError", () => {
  it("extracts the message from a Zod issue array", () => {
    // The exact shape observed from the register endpoint.
    const raw = JSON.stringify([
      {
        origin: "string",
        code: "too_small",
        minimum: 8,
        inclusive: true,
        path: ["password"],
        message: "Password must be at least 8 characters",
      },
    ]);
    expect(readableError(new Error(raw))).toBe("Password must be at least 8 characters");
  });

  it("extracts the message from an email format issue", () => {
    const raw = JSON.stringify([
      { code: "invalid_format", format: "email", path: ["email"], message: "Please enter a valid email address" },
    ]);
    expect(readableError(new Error(raw))).toBe("Please enter a valid email address");
  });

  it("passes ordinary messages through unchanged", () => {
    expect(readableError(new Error("Incorrect email or password"))).toBe(
      "Incorrect email or password"
    );
    expect(
      readableError(new Error("An account with this email already exists. Try signing in instead."))
    ).toBe("An account with this email already exists. Try signing in instead.");
  });

  it("falls back when there is nothing useful", () => {
    expect(readableError(null)).toMatch(/something went wrong/i);
    expect(readableError(new Error(""))).toMatch(/something went wrong/i);
    expect(readableError(undefined, "custom")).toBe("custom");
  });

  it("does not choke on malformed JSON that looks like JSON", () => {
    expect(readableError(new Error("[not really json"))).toBe("[not really json");
    expect(readableError(new Error("[]"))).toMatch(/something went wrong|\[\]/);
  });

  it("handles a single issue object rather than an array", () => {
    const raw = JSON.stringify({ code: "custom", message: "Single issue message" });
    expect(readableError(new Error(raw))).toBe("Single issue message");
  });
});
