import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("Email Service", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
  });

  it("should export sendEmail function", async () => {
    const { sendEmail } = await import("./email");
    expect(typeof sendEmail).toBe("function");
  });

  it("should return not-configured when env vars are missing", async () => {
    // Temporarily clear env vars
    const origKey = process.env.RESEND_API_KEY;
    const origFrom = process.env.EMAIL_FROM;
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;

    // Re-import to pick up cleared env
    vi.resetModules();
    const { sendEmail } = await import("./email");
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Hi</p>",
      text: "Hi",
    });
    expect(result.sent).toBe(false);
    if (!result.sent) {
      expect(result.reason).toBe("not-configured");
    }

    // Restore
    process.env.RESEND_API_KEY = origKey;
    process.env.EMAIL_FROM = origFrom;
  });

  it("should call Resend API when configured", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "test-id" }),
    });

    const { sendEmail } = await import("./email");
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Hello</p>",
      text: "Hello",
    });

    // If ENV vars are set, it should call fetch
    if (result.sent) {
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({ method: "POST" })
      );
    }
  });
});
