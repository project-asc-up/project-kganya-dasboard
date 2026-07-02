import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isProduction =
    process.env.NODE_ENV === "production" &&
    !process.env.VERCEL_URL?.includes("localhost") &&
    !process.env.VERCEL_URL?.includes("preview");

  const isMainBranch = process.env.VERCEL_GIT_COMMIT_REF === "main";

  if (isProduction || isMainBranch) {
    console.error("[DEPLOYMENT GUARD] Attempted access in restricted environment:", {
      nodeEnv: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL,
      gitBranch: process.env.VERCEL_GIT_COMMIT_REF,
      timestamp: new Date().toISOString(),
    });
  }

  if (isProduction && isMainBranch) {
    return NextResponse.json(
      {
        error: "Access denied",
        message: "This deployment is restricted to preview environments only.",
      },
      { status: 503 },
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico).*)",
  ],
};
