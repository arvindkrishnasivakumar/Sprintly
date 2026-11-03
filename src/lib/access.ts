import { auth } from "./auth";
import { db } from "./db";
import { redirect, notFound } from "next/navigation";
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}
export async function requireTeam(teamId: string) {
  const user = await requireUser();
  const member = await db.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: user.id } },
  });
  if (!member) notFound();
  return member;
}
export async function requireProject(id: string) {
  const project = await db.project.findUnique({ where: { id } });
  if (!project) notFound();
  await requireTeam(project.teamId);
  return project;
}
export async function requireSprint(id: string) {
  const sprint = await db.sprint.findUnique({
    where: { id },
    include: { project: true },
  });
  if (!sprint) notFound();
  await requireTeam(sprint.project.teamId);
  return sprint;
}
