import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEMO_PIN, demoCustomerRecord, demoStaffRecord, isDemoCredentials } from './demo.ts';

test('demo pin is the requested temporary code', () => {
  assert.equal(DEMO_PIN, '1111');
});

test('demo customer and staff records are admin-ready without requiring a typed email', () => {
  const customer = demoCustomerRecord('ar');
  const staff = demoStaffRecord();
  assert.equal(customer.phone, '+201111111111');
  assert.equal(staff.role, 'admin');
  assert.equal(isDemoCredentials(staff.phone, DEMO_PIN), true);
});
