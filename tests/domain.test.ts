import { test } from "node:test";
import assert from "node:assert/strict";
import { sprintMetrics } from "../src/lib/metrics";
import { registration, sprintInput, taskInput } from "../src/lib/validation";
import { hashPassword, verifyPassword } from "../src/lib/password";
test("metrics count completed points and overdue unfinished work using UTC days", () => {
  const result = sprintMetrics(
    [
      { status: "DONE", storyPoints: 5, dueDate: new Date("2026-11-01") },
      { status: "REVIEW", storyPoints: 3, dueDate: new Date("2026-11-01") },
      { status: "BACKLOG", storyPoints: 2, dueDate: new Date("2026-11-02") },
    ],
    new Date("2026-11-04"),
    new Date("2026-11-02T23:30:00Z"),
  );
  assert.deepEqual(result, {
    total: 3,
    completed: 1,
    percentage: 33,
    points: 10,
    completedPoints: 5,
    overdue: 1,
    daysRemaining: 3,
  });
});
test("empty and past sprints do not produce NaN or negative days", () => {
  assert.deepEqual(
    sprintMetrics([], new Date("2020-01-01"), new Date("2026-01-01")),
    {
      total: 0,
      completed: 0,
      percentage: 0,
      points: 0,
      completedPoints: 0,
      overdue: 0,
      daysRemaining: 0,
    },
  );
});
test("registration normalizes email and rejects weak passwords", () => {
  assert.equal(
    registration.parse({
      name: " Ada ",
      email: "ADA@example.com",
      password: "secure-pass-123",
    }).email,
    "ada@example.com",
  );
  assert.equal(
    registration.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "short",
    }).success,
    false,
  );
});
test("sprint rejects inverted and impossible dates", () => {
  const s = {
    name: "Sprint",
    goal: "",
    startDate: "2026-11-10",
    endDate: "2026-11-09",
    status: "PLANNED",
  };
  assert.equal(sprintInput.safeParse(s).success, false);
  assert.equal(
    sprintInput.safeParse({ ...s, startDate: "2026-02-30" }).success,
    false,
  );
});
test("task rejects fractions, negative points, and unknown statuses", () => {
  const t = {
    title: "Build",
    description: "",
    assigneeId: "",
    priority: "MEDIUM",
    status: "BACKLOG",
    dueDate: "",
    storyPoints: "3",
  };
  assert.equal(taskInput.parse(t).storyPoints, 3);
  for (const change of [
    { storyPoints: -1 },
    { storyPoints: 1.5 },
    { status: "INVALID" },
    { title: "  " },
    { dueDate: "2026-02-30" },
  ])
    assert.equal(taskInput.safeParse({ ...t, ...change }).success, false);
});
test("password hashes use independent salts and verify correctly", () => {
  const a = hashPassword("long-password");
  const b = hashPassword("long-password");
  assert.notEqual(a, b);
  assert.equal(verifyPassword("long-password", a), true);
  assert.equal(verifyPassword("wrong", a), false);
  assert.equal(verifyPassword("wrong", "invalid"), false);
});
