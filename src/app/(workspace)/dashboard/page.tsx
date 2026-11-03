import Link from "next/link";
import { ArrowUpRight, FolderKanban, Users, Zap } from "lucide-react";
import { requireUser } from "@/lib/access";
import { db } from "@/lib/db";
import { createTeam } from "@/lib/actions";
import { ActionForm, Field, TextArea } from "@/components/forms";
export default async function Dashboard() {
  const user = await requireUser();
  const teams = await db.team.findMany({
    where: { members: { some: { userId: user.id } } },
    include: {
      _count: { select: { members: true, projects: true } },
      projects: { include: { sprints: { where: { status: "ACTIVE" } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  const active = teams.flatMap((t) =>
    t.projects.flatMap((p) =>
      p.sprints.map((s) => ({ ...s, project: p.name })),
    ),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>Your work</h1>
          <p className="muted">
            Manage your teams, projects, and active sprints.
          </p>
        </div>
        <a className="btn" href="#new-team">
          + New team
        </a>
      </div>
      <div className="stats three">
        <div className="stat">
          <Users size={18} />
          <span>Your teams</span>
          <strong>{teams.length}</strong>
        </div>
        <div className="stat">
          <FolderKanban size={18} />
          <span>Projects</span>
          <strong>{teams.reduce((n, t) => n + t._count.projects, 0)}</strong>
        </div>
        <div className="stat">
          <Zap size={18} />
          <span>Active sprints</span>
          <strong>{active.length}</strong>
        </div>
      </div>
      <section>
        <div className="section-heading">
          <h2>Your teams</h2>
          <span className="muted">{teams.length} total</span>
        </div>
        <div className="cards">
          {teams.map((t) => (
            <Link className="card team-card" href={`/teams/${t.id}`} key={t.id}>
              <div className="card-top">
                <span className="team-mark">{t.name[0]}</span>
                <ArrowUpRight size={18} />
              </div>
              <h3>{t.name}</h3>
              <p className="muted clamp">
                {t.description || "No description."}
              </p>
              <div className="card-footer">
                {t._count.members} members{" "}
                <span>{t._count.projects} projects</span>
              </div>
            </Link>
          ))}
        </div>
        {!teams.length && (
          <div className="empty">
            <Users />
            <h3>No teams yet</h3>
            <p>Create your first team below, then add your teammates.</p>
          </div>
        )}
      </section>
      <section>
        <h2>Active sprints</h2>
        {active.length ? (
          <div className="list">
            {active.map((s) => (
              <Link
                className="list-row"
                href={`/projects/${s.projectId}/sprints/${s.id}`}
                key={s.id}
              >
                <span>
                  <strong>{s.name}</strong>
                  <small>{s.project}</small>
                </span>
                <span className="badge active">Active</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="empty compact">
            No active sprints yet. Create a project to plan your first one.
          </p>
        )}
      </section>
      <section id="new-team" className="card form-panel">
        <h2>Create a team</h2>
        <p className="muted">Create a workspace for your team.</p>
        <ActionForm action={createTeam} submit="Create team">
          <Field label="Team name" name="name" required maxLength={100} />
          <TextArea label="Description" name="description" />
        </ActionForm>
      </section>
    </>
  );
}
