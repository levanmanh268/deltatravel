import { describe, expect, it } from 'vitest';
import { ConfigService } from '@nestjs/config';

const { Gateways } = require('../../dist/payments/gateways');

function gateway() {
  return new Gateways(
    new ConfigService({
      WEB_ORIGIN: 'https://example.com',
      API_PUBLIC_URL: 'https://api.example.com',
      VNPAY_TMN_CODE: 'DEMO',
      VNPAY_HASH_SECRET: 'secret',
    }),
  );
}

function payment() {
  return {
    id: '10000000-0000-4000-8000-000000000001',
    bookingId: '20000000-0000-4000-8000-000000000001',
    provider: 'VNPAY',
    providerReference: 'REF001',
    transactionId: null,
    amount: 100000n,
    currency: 'VND',
    status: 'INITIATED',
    checkoutUrl: null,
    refundReference: null,
    refundNote: null,
    createdAt: new Date('2026-10-01T00:00:00.000Z'),
  };
}

describe('payment channel routing', () => {
  it('advertises the channels that the gateway actually implements', () => {
    const status = gateway().status();
    const vnpay = status.providers.find((item: { provider: string }) => item.provider === 'VNPAY');
    expect(vnpay.channels).toContain('VNPAY_QR');
  });

  it('adds the requested VNPay route to the signed checkout URL', async () => {
    const url = await gateway().checkout(
      payment(),
      new Date('2026-10-01T00:15:00.000Z'),
      '127.0.0.1',
      'VNPAY_QR',
    );
    expect(new URL(url).searchParams.get('vnp_BankCode')).toBe('VNPAYQR');
  });
});
