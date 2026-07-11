import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[1.75rem] border border-[color:var(--color-border)] bg-white p-6 shadow-[0_12px_40px_rgba(0,32,80,0.05)] sm:p-8 lg:flex-row lg:items-end lg:justify-between hover-lift animate-slide-up">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-primary-dark)]">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--color-text-muted)] sm:text-base">
          {description}
        </p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-6 shadow-[0_12px_40px_rgba(0,32,80,0.04)] hover-lift animate-slide-up">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-[color:var(--color-primary-dark)]">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-[color:var(--color-text-muted)]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[color:var(--color-primary-dark)]">{label}</span>
        {hint ? <span className="text-xs text-[color:var(--color-text-muted)]">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm outline-none transition-smooth placeholder:text-[color:var(--color-text-muted)] focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-focus-ring)]/25 focus:shadow-md hover:border-[color:var(--color-primary)]/50 hover:shadow-[0_2px_12px_rgba(0,59,122,0.08)]";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputClass, "min-h-32", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputClass, props.className)} />;
}

export function Checkbox({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-light)] px-4 py-3 transition-smooth hover:bg-white cursor-pointer hover-lift">
      <input type="checkbox" {...props} className="h-4 w-4 rounded border-[color:var(--color-border)] text-[color:var(--color-primary)] transition-smooth" />
      <span className="text-sm font-medium text-[color:var(--color-primary-dark)]">{label}</span>
    </label>
  );
}

export function ActionButton({
  children,
  tone = "primary",
  type = "submit",
  disabled = false,
  loading = false,
  loadingText,
  className,
  ...props
}: {
  children: ReactNode;
  tone?: "primary" | "secondary" | "danger";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variantMap = {
    primary: "primary",
    secondary: "secondary",
    danger: "danger",
  } as const;

  return (
    <Button
      type={type}
      variant={variantMap[tone]}
      disabled={disabled}
      loading={loading}
      loadingText={loadingText}
      rounded="full"
      className={cn("px-5 py-3 h-auto", className)}
      {...props}
    >
      {children}
    </Button>
  );
}

export function CreateButton({
  onClick,
  children,
  className = "",
  disabled = false,
  loading = false,
  ...props
}: {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      rounded="full"
      className={cn("px-5 py-3 h-auto", className)}
      {...props}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mr-2">
        <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {children}
    </Button>
  );
}
