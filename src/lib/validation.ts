import { z } from "zod";
export const email = z
  .email()
  .max(254)
  .transform((v) => v.toLowerCase().trim());
export const credentials = z.object({
  email,
  password: z.string().min(10).max(128),
});
export const registration = credentials.extend({
  name: z.string().trim().min(1).max(80),
});
export const named = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(3000).default(""),
});
export const projectStatuses = ["ACTIVE", "ON_HOLD", "COMPLETED"] as const;
export const sprintStatuses = ["PLANNED", "ACTIVE", "COMPLETED"] as const;
export const taskStatuses = [
  "BACKLOG",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
] as const;
export const priorities = ["LOW", "MEDIUM", "HIGH"] as const;
const date = z.iso.date();
export const sprintInput = z
  .object({
    name: named.shape.name,
    goal: z.string().trim().max(3000),
    startDate: date,
    endDate: date,
    status: z.enum(sprintStatuses),
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: "End date must be on or after start date.",
  });
export const taskInput = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000),
  assigneeId: z.string().max(100),
  priority: z.enum(priorities),
  status: z.enum(taskStatuses),
  dueDate: z.union([date, z.literal("")]),
  storyPoints: z.coerce.number().int().min(0).max(100),
});
export function label(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
