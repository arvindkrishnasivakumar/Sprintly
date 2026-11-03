"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="fallback">
      <h1>Something went wrong</h1>
      <p>We couldn’t load this workspace. Please try again.</p>
      <button className="btn" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
