import { describe, it, expect, vi } from 'vitest';

// Mock the Resend module to avoid real API calls during testing
vi.mock('resend', () => {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: vi.fn().mockResolvedValue({ id: 'test-email-id-123' }),
      },
    })),
  };
});

describe('Email Service', () => {
  it('should import email functions without errors', async () => {
    const emailModule = await import('./email');
    expect(typeof emailModule.sendWelcomeEmail).toBe('function');
    expect(typeof emailModule.sendApplicationConfirmationEmail).toBe('function');
    expect(typeof emailModule.sendNewMessageNotificationEmail).toBe('function');
    expect(typeof emailModule.sendStatusUpdateEmail).toBe('function');
    expect(typeof emailModule.sendAdminNewApplicationAlert).toBe('function');
    expect(typeof emailModule.sendJobSharedEmail).toBe('function');
  });

  it('should call sendWelcomeEmail without throwing', async () => {
    const { sendWelcomeEmail } = await import('./email');
    await expect(sendWelcomeEmail('test@example.com', 'Dr. Test')).resolves.not.toThrow();
  });

  it('should call sendApplicationConfirmationEmail without throwing', async () => {
    const { sendApplicationConfirmationEmail } = await import('./email');
    await expect(
      sendApplicationConfirmationEmail('test@example.com', 'Dr. Test', 'app-12345')
    ).resolves.not.toThrow();
  });

  it('should call sendStatusUpdateEmail without throwing', async () => {
    const { sendStatusUpdateEmail } = await import('./email');
    await expect(
      sendStatusUpdateEmail('test@example.com', 'Dr. Test', 'under-review')
    ).resolves.not.toThrow();
  });

  it('should call sendJobSharedEmail without throwing', async () => {
    const { sendJobSharedEmail } = await import('./email');
    await expect(
      sendJobSharedEmail('test@example.com', 'Dr. Test', 'Clinical Fellow', 'Barts Health', 'London')
    ).resolves.not.toThrow();
  });
});
