"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  Users,
} from "lucide-react";
export function WorkspaceNav({
  teams,
}: {
  teams: {
    id: string;
    name: string;
    projects: { id: string; name: string }[];
  }[];
}) {
  const path = usePathname();
  return (
    <nav aria-label="Workspace">
      <Link
        className={`nav-link ${path === "/dashboard" ? "selected" : ""}`}
        href="/dashboard"
      >
        <LayoutDashboard size={16} />
        Your work
      </Link>
      <div className="nav-heading">Teams & projects</div>
      {teams.map((t) => (
        <div className="nav-team" key={t.id}>
          <Link
            className={`nav-link ${path === `/teams/${t.id}` ? "selected" : ""}`}
            href={`/teams/${t.id}`}
          >
            <ChevronDown size={13} />
            <Users size={16} />
            <span>{t.name}</span>
          </Link>
          {t.projects.map((p) => (
            <Link
              className={`nav-link project-link ${path.startsWith(`/projects/${p.id}`) ? "selected" : ""}`}
              href={`/projects/${p.id}`}
              key={p.id}
            >
              <ChevronRight size={12} />
              <FolderKanban size={15} />
              <span>{p.name}</span>
            </Link>
          ))}
        </div>
      ))}
      {!teams.length && <p className="sidebar-empty">No teams yet</p>}
    </nav>
  );
}
