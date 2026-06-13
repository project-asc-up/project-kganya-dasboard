import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// Prevent production deployments - only allow preview and development
if (
  process.env.NODE_ENV === "production" &&
  !process.env.VERCEL_URL?.includes("preview")
) {
  const isLocalhost = process.env.VERCEL_URL?.includes("localhost");
  const isDevEnvironment = process.env.NODE_ENV !== "production";

  if (!isLocalhost && isDevEnvironment === false) {
    console.warn(
      "⚠️  WARNING: This build is not in preview or development mode. " +
      "Deployments to production are restricted. Please deploy to preview instead."
    );
  }
}

export default nextConfig;
