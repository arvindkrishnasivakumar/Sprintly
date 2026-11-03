"use server";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "./db";
import { signIn, signOut, throttle } from "./auth";
import {
  requireUser,
  requireTeam,
  requireProject,
  requireSprint,
} from "./access";
import { hashPassword } from "./password";
import {
  registration,
  named,
  email,
  sprintInput,
  taskInput,
  taskStatuses,
  projectStatuses,
} from "./validation";
export type Result = { error?: string; success?: string };
function data(form: FormData) {
  return Object.fromEntries(form.entries());
}
function failure(error: unknown): Result {
  if (error instanceof z.ZodError)
    return { error: error.issues[0]?.message ?? "Check your input." };
  console.error(
    "Sprintly mutation failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return { error: "Unable to save. Please try again." };
}
export async function login(_: Result, form: FormData): Promise<Result> {
  try {
    await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError)
      return {
        error:
          "Invalid email or password, or too many attempts. Try again later.",
      };
    throw error;
  }
  return {};
}
export async function signup(_: Result, form: FormData): Promise<Result> {
  const parsed = registration.safeParse(data(form));
  if (!parsed.success) return failure(parsed.error);
  const { name, email, password } = parsed.data;
  try {
    if (!(await throttle(`signup:${email}`)))
      return { error: "Too many attempts. Try again in 15 minutes." };
    await db.user.create({
      data: { name, email, passwordHash: hashPassword(password) },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === "P2002"
    )
      return { error: "Unable to create this account. Try logging in." };
    return failure(error);
  }
  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  return {};
}
export async function logout() {
  await signOut({ redirectTo: "/login" });
}
export async function createTeam(_: Result, form: FormData): Promise<Result> {
  const user = await requireUser();
  let id: string;
  try {
    const input = named.parse(data(form));
    const team = await db.team.create({
      data: {
        ...input,
        members: { create: { userId: user.id, role: "OWNER" } },
      },
    });
    id = team.id;
  } catch (error) {
    return failure(error);
  }
  revalidatePath("/dashboard");
  redirect(`/teams/${id}`);
}
export async function addMember(
  teamId: string,
  _: Result,
  form: FormData,
): Promise<Result> {
  const member = await requireTeam(teamId);
  if (member.role !== "OWNER")
    return { error: "Only the team owner can add members." };
  try {
    const address = email.parse(form.get("email"));
    const user = await db.user.findUnique({ where: { email: address } });
    if (!user)
      return {
        error: "Ask your teammate to sign up first, then add their email.",
      };
    await db.teamMember.upsert({
      where: { teamId_userId: { teamId, userId: user.id } },
      create: { teamId, userId: user.id },
      update: {},
    });
  } catch (error) {
    return failure(error);
  }
  revalidatePath(`/teams/${teamId}`);
  return { success: "Member added." };
}
export async function createProject(
  teamId: string,
  _: Result,
  form: FormData,
): Promise<Result> {
  await requireTeam(teamId);
  let id: string;
  try {
    const input = named
      .extend({ status: z.enum(projectStatuses) })
      .parse(data(form));
    const p = await db.project.create({ data: { ...input, teamId } });
    id = p.id;
  } catch (error) {
    return failure(error);
  }
  revalidatePath(`/teams/${teamId}`);
  redirect(`/projects/${id}`);
}
export async function updateProject(
  id: string,
  _: Result,
  form: FormData,
): Promise<Result> {
  await requireProject(id);
  try {
    const input = named
      .extend({ status: z.enum(projectStatuses) })
      .parse(data(form));
    await db.project.update({ where: { id }, data: input });
  } catch (error) {
    return failure(error);
  }
  revalidatePath(`/projects/${id}`);
  return { success: "Project updated." };
}
export async function saveSprint(
  projectId: string,
  sprintId: string | null,
  _: Result,
  form: FormData,
): Promise<Result> {
  await requireProject(projectId);
  if (sprintId) {
    const sprint = await requireSprint(sprintId);
    if (sprint.projectId !== projectId)
      return { error: "Sprint does not belong to this project." };
  }
  let id: string;
  try {
    const input = sprintInput.parse(data(form));
    const values = {
      ...input,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
    };
    const sprint = sprintId
      ? await db.sprint.update({ where: { id: sprintId }, data: values })
      : await db.sprint.create({ data: { ...values, projectId } });
    id = sprint.id;
  } catch (error) {
    return failure(error);
  }
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/sprints/${id}`);
  if (!sprintId) redirect(`/projects/${projectId}/sprints/${id}`);
  return { success: "Sprint updated." };
}
export async function saveTask(
  sprintId: string,
  taskId: string | null,
  _: Result,
  form: FormData,
): Promise<Result> {
  const sprint = await requireSprint(sprintId);
  if (taskId && !(await db.task.findFirst({ where: { id: taskId, sprintId } })))
    return { error: "Task not found." };
  try {
    const input = taskInput.parse(data(form));
    if (
      input.assigneeId &&
      !(await db.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: sprint.project.teamId,
            userId: input.assigneeId,
          },
        },
      }))
    )
      return { error: "Assignee must be a team member." };
    const values = {
      ...input,
      assigneeId: input.assigneeId || null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    };
    if (taskId) await db.task.update({ where: { id: taskId }, data: values });
    else await db.task.create({ data: { ...values, sprintId } });
  } catch (error) {
    return failure(error);
  }
  revalidatePath(`/projects/${sprint.projectId}/sprints/${sprintId}`);
  return { success: taskId ? "Task updated." : "Task created." };
}
export async function moveTask(
  taskId: string,
  status: string,
): Promise<Result> {
  const parsed = z.enum(taskStatuses).safeParse(status);
  if (!parsed.success) return { error: "Invalid task status." };
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) return { error: "Task not found." };
  const sprint = await requireSprint(task.sprintId);
  try {
    await db.task.update({
      where: { id: taskId },
      data: { status: parsed.data },
    });
  } catch (error) {
    return failure(error);
  }
  revalidatePath(`/projects/${sprint.projectId}/sprints/${sprint.id}`);
  return {};
}
