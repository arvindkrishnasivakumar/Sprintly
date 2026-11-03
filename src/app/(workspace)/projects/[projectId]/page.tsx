import Link from "next/link";
import { requireProject } from "@/lib/access";
import { db } from "@/lib/db";
import { saveSprint, updateProject } from "@/lib/actions";
import { ProjectForm, SprintForm } from "@/components/entity-forms";
import { label } from "@/lib/validation";
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await requireProject(projectId);
  const sprints = await db.sprint.findMany({
    where: { projectId },
    include: { _count: { select: { tasks: true } } },
    orderBy: { startDate: "desc" },
  });
  return (
    <>
      <Link className="breadcrumb" href={`/teams/${project.teamId}`}>
        ← Team workspace
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">PROJECT · {label(project.status)}</p>
          <h1>{project.name}</h1>
          <p className="muted">
            {project.description || "Your next idea, in motion."}
          </p>
          <small className="muted">
            Created {project.createdAt.toISOString().slice(0, 10)}
          </small>
        </div>
        <a href="#new-sprint" className="btn">
          + Plan sprint
        </a>
      </div>
      <section>
        <h2>
          Sprints <span className="count">{sprints.length}</span>
        </h2>
        <div className="list">
          {sprints.map((s) => (
            <Link
              className="list-row"
              key={s.id}
              href={`/projects/${projectId}/sprints/${s.id}`}
            >
              <span>
                <strong>{s.name}</strong>
                <small>{s.goal || "No sprint goal set"}</small>
              </span>
              <span className="row-meta">
                <span
                  className={`badge ${s.status === "ACTIVE" ? "active" : ""}`}
                >
                  {label(s.status)}
                </span>
                <small>
                  {s.startDate.toISOString().slice(0, 10)} →{" "}
                  {s.endDate.toISOString().slice(0, 10)} · {s._count.tasks}{" "}
                  tasks
                </small>
              </span>
            </Link>
          ))}
        </div>
        {!sprints.length && (
          <p className="empty">
            A clear goal and a short sprint. Start planning below.
          </p>
        )}
      </section>
      <div className="two-column">
        <section id="new-sprint" className="card">
          <h2>Plan a sprint</h2>
          <SprintForm action={saveSprint.bind(null, projectId, null)} />
        </section>
        <section className="card">
          <details>
            <summary>Edit project</summary>
            <ProjectForm
              action={updateProject.bind(null, projectId)}
              project={project}
            />
          </details>
        </section>
      </div>
    </>
  );
}
