import test from 'node:test';
import assert from 'node:assert';
import { AuthService } from '../dist/services/auth/authService.js';
import { db } from '../dist/database/db.js';

test('Auth Service: Password Hashing and Verification', async () => {
  const password = 'SecurePassword123!';
  const hash = await AuthService.hashPassword(password);

  assert.notStrictEqual(password, hash);
  const isMatch = await AuthService.comparePassword(password, hash);
  assert.strictEqual(isMatch, true);

  const isWrongMatch = await AuthService.comparePassword('WrongPassword!', hash);
  assert.strictEqual(isWrongMatch, false);
});

test('Auth Service: JWT Generation and Verification', async () => {
  const user = {
    id: 'test_user_uuid',
    email: 'test@nexusmind.ai',
    full_name: 'Test Investigator',
  };

  const token = AuthService.generateToken(user);
  assert.ok(typeof token === 'string' && token.length > 20);

  const decoded = AuthService.verifyToken(token);
  assert.strictEqual(decoded.id, user.id);
  assert.strictEqual(decoded.email, user.email);
});

test('Database: User Persistence', async () => {
  const created = await db.users.create({
    full_name: 'Database Unit Tester',
    email: `unit_${Date.now()}@nexusmind.ai`,
    password_hash: 'sample_hash_string',
  });

  assert.ok(created.id);
  const fetched = await db.users.findById(created.id);
  assert.strictEqual(fetched?.email, created.email);
});

