// e2e/health.spec.ts
import { test, expect } from '@playwright/test';

test('healthz ok döner', async ({ request }) => {
  const res = await request.get('/api/healthz');
  expect(res.ok()).toBe(true);
  const body = await res.json();
  expect(body.ok).toBe(true);
});
