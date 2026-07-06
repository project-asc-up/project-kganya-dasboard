import { notFound, redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getCurrentAuthorization } from "@/lib/rbac";

export default async function DevLoginPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const authz = await getCurrentAuthorization();
  if (authz) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-5 py-10 text-[var(--color-text)]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center justify-center">
        <section className="w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-[var(--shadow-xl)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-brand)]">
            Development Login
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
            Local admin sign-in
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            Use this development-only route to create or sign in with the local admin session.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
