import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

export const proxy = clerkMiddleware(async (auth, request) => {
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

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
