import { login, signup } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ActionForm, Field } from "@/components/forms";
export default async function Login() {
  if ((await auth())?.user) redirect("/dashboard");
  return (
    <main className="auth-shell">
      <section className="auth-intro">
        <div className="brand">
          <span className="brand-icon">S</span>Sprintly
        </div>
        <p className="eyebrow">SMALL TEAMS. REAL PROGRESS.</p>
        <h1>
          Your next great project
          <br />
          starts with a sprint.
        </h1>
        <p>
          Bring your team, organize the work, and ship something you’re proud
          of.
        </p>
        <div className="auth-note">Built for student engineering teams.</div>
      </section>
      <section className="auth-card">
        <h2>Welcome back</h2>
        <p className="muted">Sign in to your workspace.</p>
        <ActionForm action={login} submit="Log in">
          <Field
            label="Email"
            name="email"
            type="email"
            required
            maxLength={254}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            required
            maxLength={128}
          />
        </ActionForm>
        <details className="signup">
          <summary>New here? Create an account</summary>
          <ActionForm action={signup} submit="Create account">
            <Field label="Name" name="name" required maxLength={80} />
            <Field
              label="Email"
              name="email"
              type="email"
              required
              maxLength={254}
            />
            <Field
              label="Password (10–128 characters)"
              name="password"
              type="password"
              required
              maxLength={128}
            />
          </ActionForm>
        </details>
      </section>
    </main>
  );
}
