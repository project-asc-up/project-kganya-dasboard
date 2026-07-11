import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="rounded-[1.75rem] border border-[color:var(--color-border)] bg-white p-8 shadow-[0_12px_40px_rgba(0,32,80,0.05)]">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]">
        Not found
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-primary-dark)]">
        This admin record does not exist.
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--color-text-muted)]">
        The item may have been deleted or the URL may be outdated. Return to the admin dashboard or open
        the entity directory to continue.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="primary" size="lg" rounded="full">
          <Link href="/admin">
            Back to dashboard
          </Link>
        </Button>
        <Button asChild variant="secondary" size="lg" rounded="full">
          <Link href="/admin/faculties">
            Open faculties
          </Link>
        </Button>
      </div>
    </div>
  );
}
