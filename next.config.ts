/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack warning is due to multiple lockfiles in parent directories.
  // We can't easily fix the inference without removing the parent lockfile,
  // but we can ensure the app runs correctly by consolidating the proxy/middleware.
};

export default nextConfig;
