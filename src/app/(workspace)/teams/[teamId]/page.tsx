import Link from "next/link";
import { requireTeam } from "@/lib/access";
import { db } from "@/lib/db";
import { addMember, createProject } from "@/lib/actions";
import { ActionForm, Field } from "@/components/forms";
import { ProjectForm } from "@/components/entity-forms";
import { label } from "@/lib/validation";
export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const membership = await requireTeam(teamId);
  const team = await db.team.findUniqueOrThrow({
    where: { id: teamId },
    include: {
      members: { include: { user: true }, orderBy: { joinedAt: "asc" } },
      projects: {
        include: { _count: { select: { sprints: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return (
    <>
      <Link href="/dashboard" className="breadcrumb">
        ← Overview
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">TEAM WORKSPACE</p>
          <h1>{team.name}</h1>
          <p className="muted">
            {team.description || "Build something great together."}
          </p>
        </div>
        <a className="btn" href="#new-project">
          + New project
        </a>
      </div>
      <section>
        <h2>
          Projects <span className="count">{team.projects.length}</span>
        </h2>
        <div className="list">
          {team.projects.map((p) => (
            <Link className="list-row" key={p.id} href={`/projects/${p.id}`}>
              <span>
                <strong>{p.name}</strong>
                <small>{p.description || "No description"}</small>
              </span>
              <span className="row-meta">
                <span className="badge">{label(p.status)}</span>
                <small>
                  {p._count.sprints} sprints ·{" "}
                  {p.createdAt.toISOString().slice(0, 10)}
                </small>
              </span>
            </Link>
          ))}
        </div>
        {!team.projects.length && (
          <p className="empty">
            No projects yet. Create your first project below.
          </p>
        )}
      </section>
      <div className="two-column">
        <section id="new-project" className="card">
          <h2>Create a project</h2>
          <ProjectForm action={createProject.bind(null, teamId)} />
        </section>
        <section className="card">
          <h2>Team members</h2>
          <div className="members">
            {team.members.map((m) => (
              <div className="member" key={m.userId}>
                <span className="avatar">{m.user.name[0]}</span>
                <span>
                  <strong>{m.user.name}</strong>
                  <small>{m.user.email}</small>
                </span>
                <span className="badge">{label(m.role)}</span>
              </div>
            ))}
          </div>
          {membership.role === "OWNER" && (
            <>
              <h3>Add a teammate</h3>
              <p className="muted">They’ll need a Sprintly account first.</p>
              <ActionForm
                action={addMember.bind(null, teamId)}
                submit="Add member"
              >
                <Field
                  label="Teammate email"
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                />
              </ActionForm>
            </>
          )}
        </section>
      </div>
    </>
  );
}
