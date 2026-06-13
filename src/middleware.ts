import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if running in production environment
  const isProduction =
    process.env.NODE_ENV === "production" &&
    !process.env.VERCEL_URL?.includes("localhost") &&
    !process.env.VERCEL_URL?.includes("preview");

  // Check if this is a main branch deployment (should be blocked)
  const isMainBranch = process.env.VERCEL_GIT_COMMIT_REF === "main";

  // Log deployment environment info
  if (isProduction || isMainBranch) {
    console.error(
      "[DEPLOYMENT GUARD] Attempted access in restricted environment:",
      {
        nodeEnv: process.env.NODE_ENV,
        vercelUrl: process.env.VERCEL_URL,
        gitBranch: process.env.VERCEL_GIT_COMMIT_REF,
        timestamp: new Date().toISOString(),
      }
    );
  }

  // Only allow requests in preview or development
  if (isProduction && isMainBranch) {
    return NextResponse.json(
      {
        error: "Access denied",
        message: "This deployment is restricted to preview environments only.",
      },
      { status: 503 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
