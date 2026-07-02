# Project ASC - Deployment Configuration

## Deployment Flow

This project is configured for the standard GitHub-to-Vercel flow:

- Pushes to `main` are allowed to create production deployments.
- Pushes to non-main branches are allowed to create preview deployments.
- The Next.js runtime reports deployment environment details but does not block production `main`.

## Configuration Overview

### Vercel Configuration

`vercel.json` enables deployments from `main` and does not block preview or production deployments.

### Runtime Configuration

`src/lib/deployment-config.ts` centralizes environment reporting for build and runtime logs.

### Proxy

`src/proxy.ts` forwards the current pathname to server components for active navigation state. It does not block deployments.

## Environment Variables

The deployment helpers read these Vercel-provided variables when available:

- `NODE_ENV`
- `VERCEL_ENV`
- `VERCEL_URL`
- `VERCEL_GIT_COMMIT_REF`

## Deploying Changes

To publish changes to the hosted app:

```bash
git checkout main
git pull origin main
git push origin main
```

Vercel should then build and deploy the latest `main` commit automatically.

## Troubleshooting

If GitHub shows the latest commit but the app has not updated:

1. Check the Vercel deployment for the latest `main` commit.
2. Confirm the deployment completed successfully.
3. Hard-refresh the browser or open the deployment URL directly.
4. Check build logs for environment variable or database connection failures.
