import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

export const proxy = clerkMiddleware(async (auth, request) => {
  const session = await auth();
  const isSignedIn = !!session.userId;

  if (isProtectedRoute(request)) {
    const signInUrl = new URL("/sign-in", request.url).toString();
    const unauthorizedUrl = new URL("/", request.url).toString();

    await auth.protect({
      unauthenticatedUrl: signInUrl,
      unauthorizedUrl,
    });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const now = Date.now();
  const TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

  if (isSignedIn) {
    const lastActivityCookie = request.cookies.get("asc_last_activity")?.value;

    if (lastActivityCookie) {
      const lastActivity = Number(lastActivityCookie);
      if (Number.isFinite(lastActivity) && now - lastActivity > TIMEOUT_MS) {
        // Session timeout reached! Perform hard logout by destroying session cookies.
        const response = NextResponse.redirect(new URL("/sign-in", request.url));
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
