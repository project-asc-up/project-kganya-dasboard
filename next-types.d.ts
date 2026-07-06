declare module "next/types.js" {
  export type ResolvingMetadata = unknown;
  export type ResolvingViewport = unknown;
}

declare module "next/server.js" {
  export type NextRequest = Request;
}

declare module "next/server" {
  export type NextRequest = Request;
  export type NextResponse = Response & {
    cookies: {
      set: (name: string, value: string, options?: unknown) => void;
      delete: (name: string) => void;
    };
  };
  export const NextResponse: {
    json: (body: unknown, init?: ResponseInit) => NextResponse;
    redirect: (url: string | URL, init?: number | ResponseInit) => NextResponse;
    next: (init?: unknown) => NextResponse;
  };
}

declare module "next/navigation" {
  export function redirect(url: string): never;
  export function notFound(): never;
  export function useRouter(): {
    push: (href: string, options?: { scroll?: boolean }) => void;
    replace: (href: string, options?: { scroll?: boolean }) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
  };
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}

declare module "next/cache" {
  export function unstable_cache<T extends (...args: never[]) => unknown>(
    fn: T,
    keyParts: readonly unknown[],
    options?: { revalidate?: number; tags?: string[] }
  ): T;
  export function revalidatePath(path: string, type?: "layout" | "page"): void;
  export function revalidateTag(tag: string, profile?: "max"): void;
}

declare module "next/headers" {
  export function cookies(): {
    get: (name: string) => { value: string } | undefined;
    set: (name: string, value: string, options?: unknown) => void;
    delete: (name: string) => void;
  };
  export function headers(): Headers;
}

declare module "next/link" {
  import type { AnchorHTMLAttributes, DetailedHTMLProps } from "react";

  type LinkProps = DetailedHTMLProps<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > & {
    href: string;
    [key: string]: unknown;
  };

  const Link: (props: LinkProps) => React.ReactElement | null;
  export default Link;
}

declare module "next/image" {
  import type { ImgHTMLAttributes } from "react";

  type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    [key: string]: unknown;
  };

  const Image: (props: ImageProps) => React.ReactElement | null;
  export default Image;
}

declare module "next" {
  export type Metadata = Record<string, unknown>;
}
