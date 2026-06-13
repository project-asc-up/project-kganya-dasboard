/**
 * Environment Deployment Guards
 * 
 * This file ensures that the application only deploys to preview environments
 * and never to production. It provides utilities for checking and validating
 * the current deployment environment.
 */

export const deploymentConfig = {
  // Check if running in production
  isProduction: () => process.env.NODE_ENV === "production",

  // Check if running in preview environment
  isPreview: () => {
    const vercelUrl = process.env.VERCEL_URL || "";
    const vercelEnv = process.env.VERCEL_ENV || "";
    return vercelEnv === "preview" || vercelUrl.includes("preview");
  },

  // Check if running in development
  isDevelopment: () => process.env.NODE_ENV === "development",

  // Check if running on localhost
  isLocalhost: () => {
    const vercelUrl = process.env.VERCEL_URL || "";
    return vercelUrl.includes("localhost") || !vercelUrl;
  },

  // Get current environment name
  getEnvironment: () => {
    if (deploymentConfig.isDevelopment()) return "development";
    if (deploymentConfig.isPreview()) return "preview";
    if (deploymentConfig.isProduction()) return "production";
    return "unknown";
  },

  // Check if deployment is allowed
  isDeploymentAllowed: () => {
    const branch = process.env.VERCEL_GIT_COMMIT_REF || "";
    const isMainBranch = branch === "main";
    const isPreviewOnly = !isMainBranch;

    // Only allow non-main branches (preview deployments)
    return isPreviewOnly || deploymentConfig.isDevelopment();
  },

  // Get deployment status
  getDeploymentStatus: () => {
    const isAllowed = deploymentConfig.isDeploymentAllowed();
    const environment = deploymentConfig.getEnvironment();
    const branch = process.env.VERCEL_GIT_COMMIT_REF || "unknown";

    return {
      allowed: isAllowed,
      environment,
      branch,
      message: isAllowed
        ? `Deployment allowed: ${environment} environment on branch '${branch}'`
        : `Deployment blocked: main branch deployments are disabled. Only preview deployments are allowed.`,
    };
  },

  // Log deployment information
  logDeploymentInfo: () => {
    const status = deploymentConfig.getDeploymentStatus();
    const prefix = status.allowed ? "✓" : "✗";
    console.log(`${prefix} [DEPLOYMENT] ${status.message}`);
    console.log(
      `  Environment: ${status.environment} | Branch: ${status.branch}`
    );
  },

  // Validate deployment (throw if not allowed)
  validateDeployment: () => {
    if (!deploymentConfig.isDeploymentAllowed()) {
      throw new Error(
        "Production deployments are disabled. Only preview deployments are allowed."
      );
    }
  },
};

// Log deployment info on module load
if (typeof window === "undefined") {
  // Server-side only
  try {
    deploymentConfig.logDeploymentInfo();
  } catch {
    // Silently fail if logging fails
  }
}
