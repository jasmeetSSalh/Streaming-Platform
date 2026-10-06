import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, validateRegistration, verifyPassword } from "../src/lib/password";
import { canAccessAdmin } from "../src/lib/auth-policy";

test("registration normalizes email and accepts a strong password", () => {
  assert.deepEqual(validateRegistration("  PERSON@Example.com ", "StrongPassword1!"), {
    email: "person@example.com", emailIsValid: true, passwordIsStrong: true,
  });
});

test("registration rejects malformed email and weak passwords", () => {
  assert.deepEqual(validateRegistration("not-an-email", "simple"), {
    email: "not-an-email", emailIsValid: false, passwordIsStrong: false,
  });
});

test("password hashing verifies the original and rejects a different password", async () => {
  const storedHash = await hashPassword("StrongPassword1!");
  assert.ok(!storedHash.includes("StrongPassword1!"));
  assert.equal(await verifyPassword("StrongPassword1!", storedHash), true);
  assert.equal(await verifyPassword("wrong-password", storedHash), false);
});

test("admin role policy grants admin access only to admins", () => {
  assert.equal(canAccessAdmin("ADMIN"), true);
  assert.equal(canAccessAdmin("USER"), false);
});
