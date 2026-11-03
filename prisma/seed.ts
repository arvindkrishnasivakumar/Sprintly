// Explicitly opt in: DEMO_PASSWORD=... npm run db:seed
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/password";
const password = process.env.DEMO_PASSWORD;
if (!password || password.length < 10)
  throw new Error(
    "Set DEMO_PASSWORD to at least 10 characters. Use only a development database.",
  );
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const day = (offset: number) => {
  const date = new Date();
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + offset,
    ),
  );
};
async function main() {
  const owner = await db.user.upsert({
    where: { email: "demo@sprintly.local" },
    update: {},
    create: {
      id: "demo-owner",
      name: "Alex Morgan",
      email: "demo@sprintly.local",
      passwordHash: hashPassword(password!),
    },
  });
  const teammates = await Promise.all(
    [
      ["demo-maya", "Maya Chen"],
      ["demo-jordan", "Jordan Lee"],
    ].map(([id, name]) =>
      db.user.upsert({
        where: { id },
        update: {},
        create: {
          id,
          name,
          email: `${id}@sprintly.local`,
          passwordHash: hashPassword(password!),
        },
      }),
    ),
  );
  const team = await db.team.upsert({
    where: { id: "demo-team" },
    update: {},
    create: {
      id: "demo-team",
      name: "Studio North",
      description:
        "Three engineers turning ambitious ideas into useful products.",
      members: {
        create: [
          { userId: owner.id, role: "OWNER" },
          ...teammates.map((u) => ({ userId: u.id, role: "MEMBER" as const })),
        ],
      },
    },
  });
  const project = await db.project.upsert({
    where: { id: "demo-project" },
    update: {},
    create: {
      id: "demo-project",
      teamId: team.id,
      name: "Campus Connect",
      description:
        "A better way for students to discover events and find their people.",
    },
  });
  const sprint = await db.sprint.upsert({
    where: { id: "demo-sprint" },
    update: {},
    create: {
      id: "demo-sprint",
      projectId: project.id,
      name: "Sprint 03 · The first experience",
      goal: "Ship a smooth onboarding flow and make campus events easy to discover.",
      startDate: day(-4),
      endDate: day(9),
      status: "ACTIVE",
    },
  });
  const work = [
    {
      title: "Design the event discovery filters",
      description: "Help students find events by interest, date, and location.",
      status: "BACKLOG" as const,
      priority: "MEDIUM" as const,
      storyPoints: 3,
      assigneeId: teammates[0].id,
      dueDate: day(3),
    },
    {
      title: "Add empty states to the events feed",
      description: "Give new users a clear next step when no events match.",
      status: "BACKLOG" as const,
      priority: "LOW" as const,
      storyPoints: 2,
      assigneeId: null,
      dueDate: day(5),
    },
    {
      title: "Build the onboarding flow",
      description: "Connect the welcome screens to profile creation.",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      storyPoints: 5,
      assigneeId: owner.id,
      dueDate: day(2),
    },
    {
      title: "Create the event detail page",
      description:
        "Show event information, organizer details, and an RSVP action.",
      status: "IN_PROGRESS" as const,
      priority: "MEDIUM" as const,
      storyPoints: 5,
      assigneeId: teammates[1].id,
      dueDate: day(4),
    },
    {
      title: "Review mobile navigation",
      description:
        "Check focus order, touch targets, and smaller screen layouts.",
      status: "REVIEW" as const,
      priority: "HIGH" as const,
      storyPoints: 2,
      assigneeId: teammates[0].id,
      dueDate: day(-1),
    },
    {
      title: "Set up the design foundation",
      description: "Define spacing, typography, and reusable UI primitives.",
      status: "DONE" as const,
      priority: "MEDIUM" as const,
      storyPoints: 3,
      assigneeId: teammates[0].id,
      dueDate: day(-2),
    },
    {
      title: "Create the project database",
      description: "Model users, campus events, and registrations.",
      status: "DONE" as const,
      priority: "HIGH" as const,
      storyPoints: 5,
      assigneeId: owner.id,
      dueDate: day(-3),
    },
  ];
  for (const [index, task] of work.entries())
    await db.task.upsert({
      where: { id: `demo-task-${index}` },
      update: {},
      create: { id: `demo-task-${index}`, sprintId: sprint.id, ...task },
    });
  console.log(
    "Demo ready. Email: demo@sprintly.local. Password: your DEMO_PASSWORD value.",
  );
  console.log(
    "Open /projects/demo-project/sprints/demo-sprint after logging in.",
  );
}
main().finally(() => db.$disconnect());
