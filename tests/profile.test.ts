import assert from "node:assert/strict";
import test from "node:test";
import { validateProfile } from "../src/lib/profile";

const base = { name: " Jas ", email: " Jas@Example.com ", newPassword: "", confirmPassword: "" };

test("profile update normalizes fields and allows leaving the password unchanged", () => {
  assert.deepEqual(validateProfile(base), { data: { name: "Jas", email: "jas@example.com", newPassword: null } });
});

test("profile update rejects a blank name and malformed email", () => {
  assert.ok("error" in validateProfile({ ...base, name: "   " }));
  assert.ok("error" in validateProfile({ ...base, email: "nope" }));
});

test("profile password change must be strong and confirmed", () => {
  assert.ok("error" in validateProfile({ ...base, newPassword: "weak", confirmPassword: "weak" }));
  assert.deepEqual(validateProfile({ ...base, newPassword: "StrongPassword1!", confirmPassword: "Different1!xyz" }), { error: "New passwords do not match." });
  assert.equal((validateProfile({ ...base, newPassword: "StrongPassword1!", confirmPassword: "StrongPassword1!" }) as { data: { newPassword: string } }).data.newPassword, "StrongPassword1!");
});
