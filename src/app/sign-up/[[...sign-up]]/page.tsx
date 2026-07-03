import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-5 py-10 text-[var(--color-text)]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-xl)] lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden bg-[var(--color-brand)] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between">
            <Link href="/" className="flex items-center gap-3">
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
                <p className="text-lg font-semibold">
                  Academic Success Coaches
                </p>
              </div>
            </Link>

            <div className="space-y-4">
              <div className="h-1 w-20 rounded-full bg-[var(--color-accent)]" />
              <h1 className="text-3xl font-semibold leading-tight tracking-tight">
                Create your secure workspace account.
              </h1>
              <p className="text-sm leading-6 text-white/80">
                Clerk manages registration, verification, secure passwords, and
                session handling for the admin area.
              </p>
            </div>
          </section>

          <section className="flex min-h-[36rem] items-center justify-center px-6 py-10 sm:px-10">
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

              <SignUp
                fallbackRedirectUrl="/admin"
                forceRedirectUrl="/admin"
                signInUrl="/sign-in"
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
