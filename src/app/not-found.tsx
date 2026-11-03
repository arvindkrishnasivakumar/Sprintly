import Link from "next/link";
export default function NotFound() {
  return (
    <main className="fallback">
      <h1>Workspace not found</h1>
      <p>This item doesn’t exist, or you don’t have access.</p>
      <Link className="btn" href="/dashboard">
        Back to dashboard
      </Link>
    </main>
  );
}
