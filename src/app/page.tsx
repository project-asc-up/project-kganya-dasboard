import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1.1fr)]">
        <section className="hidden bg-[var(--color-brand)] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/up-logo.png"
              alt="University of Pretoria"
              width={48}
              height={48}
              priority
              className="h-12 w-12 rounded-[var(--radius-sm)] bg-white object-contain p-1.5"
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">
                University of Pretoria
              </p>
              <p className="text-lg font-semibold">Academic Success Coaches</p>
            </div>
          </div>

          <div className="max-w-lg space-y-6">
            <div className="h-1 w-20 rounded-full bg-[var(--color-accent)]" />
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white">
              Secure access to the content workspace.
            </h1>
            <p className="text-base leading-7 text-white/80">
              Manage faculty support content, coach details, curriculum links,
              resources, and FAQs from one focused administration surface.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm text-white/80">
            <div className="border-l-2 border-[var(--color-accent)] pl-3">
              Verified records
            </div>
            <div className="border-l-2 border-white/35 pl-3">
              Guided updates
            </div>
            <div className="border-l-2 border-[var(--color-danger)] pl-3">
              Protected access
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <Image
                src="/up-logo.png"
                alt="University of Pretoria"
                width={44}
                height={44}
                priority
                className="h-11 w-11 rounded-[var(--radius-sm)] bg-white object-contain p-1 shadow-[var(--shadow-sm)]"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]">
                  University of Pretoria
                </p>
                <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                  Academic Success Coaches
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-xl)]">
              <div className="border-b border-[var(--color-border)] px-6 py-6 sm:px-8">
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-danger)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
                  <span className="h-2.5 w-10 rounded-full bg-[var(--color-brand)]" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-brand)]">
                  Welcome back
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text)]">
                  Sign in to continue
                </h2>
              </div>

              <div className="px-6 py-6 sm:px-8">
                <Show when="signed-out">
                  <div className="space-y-5">
                    <div className="grid gap-3">
                      <SignInButton
                        mode="modal"
                        fallbackRedirectUrl="/admin"
                        forceRedirectUrl="/admin"
                      >
                        <button
                          type="button"
                          className="inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition hover:bg-[var(--color-brand-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface-raised)]"
                        >
                          Sign In
                        </button>
                      </SignInButton>
                    </div>
                  </div>
                </Show>

                <Show when="signed-in">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text)]">
                          You are signed in
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                          Your Clerk session is active.
                        </p>
                      </div>
                      <UserButton />
                    </div>

                    <Link
                      href="/admin"
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition hover:bg-[var(--color-brand-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface-raised)]"
                    >
                      Open Admin Workspace
                    </Link>
                  </div>
                </Show>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
