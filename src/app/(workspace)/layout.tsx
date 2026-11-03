import Link from "next/link";
import { LayoutDashboard, Users, ArrowUpRight } from "lucide-react";
import { requireUser } from "@/lib/access";
import { db } from "@/lib/db";
import { logout } from "@/lib/actions";
export default async function Workspace({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const teams = await db.team.findMany({
    where: { members: { some: { userId: user.id } } },
    orderBy: { name: "asc" },
  });
  return (
    <div className="workspace">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link href="/dashboard" className="brand">
          <span className="brand-icon">S</span>Sprintly
          <span className="beta">MVP</span>
        </Link>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav>
          <Link className="nav-link" href="/dashboard">
            <LayoutDashboard size={17} />
            Overview
          </Link>
          <div className="nav-heading">
            Teams <Users size={14} />
          </div>
          {teams.map((t) => (
            <Link className="nav-link" key={t.id} href={`/teams/${t.id}`}>
              <span className="team-icon">{t.name[0].toUpperCase()}</span>
              <span>{t.name}</span>
            </Link>
          ))}
          {!teams.length && (
            <p className="sidebar-empty">Your teams will appear here.</p>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="tip">
            A little structure.
            <br />A lot more momentum.
            <ArrowUpRight size={17} />
          </div>
          <div className="profile">
            <span className="avatar">{user.name?.[0]?.toUpperCase()}</span>
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <form action={logout}>
            <button className="text-button">Log out</button>
          </form>
        </div>
      </aside>
      <main id="main" className="main">
        <header className="topbar">
          <span>
            Workspace <span className="muted">/ Sprintly</span>
          </span>
          <span className="live-dot">Let’s make progress</span>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
