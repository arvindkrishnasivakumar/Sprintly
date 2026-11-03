import Link from "next/link";
import { Grid2X2, Layers, Plus } from "lucide-react";
import { requireUser } from "@/lib/access";
import { db } from "@/lib/db";
import { logout } from "@/lib/actions";
import { WorkspaceNav } from "@/components/workspace-nav";
export default async function Workspace({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const teams = await db.team.findMany({
    where: { members: { some: { userId: user.id } } },
    include: {
      projects: { select: { id: true, name: true }, orderBy: { name: "asc" } },
    },
    orderBy: { name: "asc" },
  });
  return (
    <div className="workspace">
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className="app-header">
        <Link href="/dashboard" className="brand">
          <Grid2X2 size={17} className="app-switcher" />
          <Layers size={23} className="brand-symbol" />
          Sprintly
        </Link>
        <span className="header-workspace">Engineering workspace</span>
        <Link href="/dashboard#new-team" className="btn header-create">
          <Plus size={15} />
          Create team
        </Link>
        <span className="header-divider" />
        <span className="header-user">{user.name}</span>
        <span className="avatar" title={user.email ?? undefined}>
          {user.name?.[0]?.toUpperCase()}
        </span>
      </header>
      <aside className="sidebar">
        <WorkspaceNav teams={teams} />
        <div className="sidebar-bottom">
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
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
