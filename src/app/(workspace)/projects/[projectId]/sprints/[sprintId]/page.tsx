import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSprint } from "@/lib/access";
import { db } from "@/lib/db";
import { sprintMetrics } from "@/lib/metrics";
import { label } from "@/lib/validation";
import { saveSprint } from "@/lib/actions";
import { SprintForm } from "@/components/entity-forms";
import { Board } from "@/components/board";
export default async function SprintPage({
  params,
}: {
  params: Promise<{ projectId: string; sprintId: string }>;
}) {
  const { projectId, sprintId } = await params;
  const sprint = await requireSprint(sprintId);
  if (sprint.projectId !== projectId) notFound();
  const [tasks, memberships] = await Promise.all([
    db.task.findMany({ where: { sprintId }, orderBy: { createdAt: "asc" } }),
    db.teamMember.findMany({
      where: { teamId: sprint.project.teamId },
      include: { user: true },
      orderBy: { joinedAt: "asc" },
    }),
  ]);
  const members = memberships.map((m) => ({
    id: m.user.id,
    name: m.user.name,
  }));
  const metrics = sprintMetrics(tasks, sprint.endDate);
  const stats = [
    ["Total tasks", metrics.total],
    ["Completed tasks", metrics.completed],
    ["Complete", `${metrics.percentage}%`],
    ["Story points", metrics.points],
    ["Completed points", metrics.completedPoints],
    ["Overdue tasks", metrics.overdue],
    ["Days remaining", metrics.daysRemaining],
  ];
  return (
    <>
      <Link href={`/projects/${projectId}`} className="breadcrumb">
        ← {sprint.project.name}
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">SPRINT</p>
          <h1>
            {sprint.name} <span className="badge">{label(sprint.status)}</span>
          </h1>
          <p className="muted">{sprint.goal || "No sprint goal set."}</p>
          <small className="muted">
            {sprint.startDate.toISOString().slice(0, 10)} →{" "}
            {sprint.endDate.toISOString().slice(0, 10)} · Dates in UTC
          </small>
        </div>
      </div>
      <div className="stats sprint-stats">
        {stats.map(([name, value]) => (
          <div className="stat" key={name}>
            <span>{name}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-label="Sprint completion"
        aria-valuenow={metrics.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div style={{ width: `${metrics.percentage}%` }} />
      </div>
      <Board
        sprintId={sprintId}
        members={members}
        tasks={tasks.map((t) => ({
          ...t,
          dueDate: t.dueDate?.toISOString() ?? null,
        }))}
      />
      <div className="sprint-settings">
        <section className="card">
          <details>
            <summary>Edit sprint</summary>
            <SprintForm
              action={saveSprint.bind(null, projectId, sprintId)}
              sprint={sprint}
            />
          </details>
        </section>
      </div>
    </>
  );
}
