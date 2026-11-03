import assert from "node:assert/strict";
import test from "node:test";
import { latestPlanByUser, parseUserSort, sortUsers } from "../src/lib/admin-users";

const users = [
  { name: "carl", createdAt: new Date("2026-10-03") },
  { name: "Alice", createdAt: new Date("2026-10-01") },
  { name: "bob", createdAt: new Date("2026-10-02") },
];

test("user list sort defaults to newest and ignores unknown values", () => {
  assert.equal(parseUserSort(undefined), "newest");
  assert.equal(parseUserSort("drop table"), "newest");
  assert.equal(parseUserSort("name"), "name");
  assert.equal(parseUserSort("oldest"), "oldest");
});

test("user list sorts by name (case-insensitive) and by signup date", () => {
  assert.deepEqual(sortUsers(users, "name").map((u) => u.name), ["Alice", "bob", "carl"]);
  assert.deepEqual(sortUsers(users, "newest").map((u) => u.name), ["carl", "bob", "Alice"]);
  assert.deepEqual(sortUsers(users, "oldest").map((u) => u.name), ["Alice", "bob", "carl"]);
  assert.equal(users[0].name, "carl", "input is not mutated");
});

test("user list shows the plan from each user's most recent active subscription", () => {
  const plans = latestPlanByUser([
    { userId: "u1", planName: "BASIC", startedAt: new Date("2026-10-01") },
    { userId: "u1", planName: "PREMIUM", startedAt: new Date("2026-10-05") },
    { userId: "u2", planName: "FREE", startedAt: new Date("2026-10-02") },
  ]);
  assert.equal(plans.get("u1"), "PREMIUM");
  assert.equal(plans.get("u2"), "FREE");
  assert.equal(plans.get("u3"), undefined);
});
