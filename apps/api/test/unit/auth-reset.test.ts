import { describe, it, expect, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordSchema } from '@tour/shared';

const { AuthService } = require('../../dist/auth/auth.service');

describe('password reset safety', () => {
  it('uses a generic success response for an unknown email', async () => {
    const db = { user: { findUnique: vi.fn().mockResolvedValue(null) } };
    const mail = { sendPasswordReset: vi.fn() };
    const service = new AuthService(
      db,
      {},
      new ConfigService({ JWT_SECRET: 'x'.repeat(32) }),
      mail,
    );
    await expect(service.requestPasswordReset({ email: 'missing@example.com' })).resolves.toEqual({
      ok: true,
    });
    expect(mail.sendPasswordReset).not.toHaveBeenCalled();
  });

  it('does not disclose an existing account when mail delivery fails', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const tx = {
      passwordResetChallenge: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi.fn().mockResolvedValue({ id: 'challenge-1' }),
      },
    };
    const db = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
          isActive: true,
        }),
      },
      serial: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
      passwordResetChallenge: { deleteMany },
    };
    const mail = { sendPasswordReset: vi.fn().mockRejectedValue(new Error('mail down')) };
    const service = new AuthService(
      db,
      {},
      new ConfigService({ JWT_SECRET: 'x'.repeat(32) }),
      mail,
    );

    await expect(service.requestPasswordReset({ email: 'user@example.com' })).resolves.toEqual({
      ok: true,
    });
    expect(deleteMany).toHaveBeenCalledWith({ where: { id: 'challenge-1' } });
  });

  it('requires a 6 digit code and a strong new password', () => {
    expect(
      ResetPasswordSchema.safeParse({
        email: 'user@example.com',
        code: '123456',
        newPassword: 'NewDemoPassword_123!',
      }).success,
    ).toBe(true);
    expect(
      ResetPasswordSchema.safeParse({
        email: 'user@example.com',
        code: '12345',
        newPassword: 'short',
      }).success,
    ).toBe(false);
  });
});
