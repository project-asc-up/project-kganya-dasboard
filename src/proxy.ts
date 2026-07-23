import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getAuthSessionSecret, verifyAuthSessionToken } from "@/lib/auth-session";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

type MiddlewareRequest = Request & {
  nextUrl: URL;
  cookies: {
    get(name: string): { value: string } | undefined;
  };
};

async function hasDevelopmentAdminSession(request: MiddlewareRequest) {
  if (process.env.NODE_ENV !== "development") return false;

  const sessionSecret = getAuthSessionSecret();
  if (!sessionSecret) return false;

  const session = await verifyAuthSessionToken(request.cookies.get("asc_admin_session")?.value, {
    secret: sessionSecret,
  });

  return session?.username === "admin";
}

export default clerkMiddleware(async (auth, request) => {
  const middlewareRequest = request as MiddlewareRequest;
  const hasLocalAdminSession = await hasDevelopmentAdminSession(middlewareRequest);
  const secretParam = middlewareRequest.nextUrl.searchParams.get("secret");
  const isBackfillSecret =
    middlewareRequest.nextUrl.pathname === "/api/admin/dify-sync/backfill" &&
    !!process.env.ADMIN_PASSWORD &&
    secretParam === process.env.ADMIN_PASSWORD;

  if (hasLocalAdminSession || isBackfillSecret) {
    const requestHeaders = new Headers(middlewareRequest.headers);
    requestHeaders.set("x-pathname", middlewareRequest.nextUrl.pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const session = await auth();
  const isSignedIn = !!session.userId;

  if (isProtectedRoute(middlewareRequest)) {
    const signInUrl = new URL("/sign-in", middlewareRequest.url).toString();
    const unauthorizedUrl = new URL("/", middlewareRequest.url).toString();

    await auth.protect({
      unauthenticatedUrl: signInUrl,
      unauthorizedUrl,
    });
  }

  const requestHeaders = new Headers(middlewareRequest.headers);
  requestHeaders.set("x-pathname", middlewareRequest.nextUrl.pathname);

  const now = Date.now();
  const TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

  if (isSignedIn) {
    const lastActivityCookie = middlewareRequest.cookies.get("asc_last_activity")?.value;

    if (lastActivityCookie) {
      const lastActivity = Number(lastActivityCookie);
      if (Number.isFinite(lastActivity) && now - lastActivity > TIMEOUT_MS) {
        // Session timeout reached! Perform hard logout by destroying session cookies.
        const response = NextResponse.redirect(new URL("/sign-in", middlewareRequest.url));
        response.cookies.delete("__session");
        response.cookies.delete("asc_last_activity");
        response.cookies.delete("asc_admin_session");
        return response;
      }
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.cookies.set("asc_last_activity", String(now), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } else {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.cookies.delete("asc_last_activity");
    return response;
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
