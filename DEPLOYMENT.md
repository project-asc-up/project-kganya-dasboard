# Project ASC - Deployment Configuration

## Deployment Environment Restrictions

This project is configured to **only deploy to preview environments** and is **strictly blocked from production deployments**.

### Configuration Overview

#### 1. **Vercel Configuration** (`vercel.json`)
- Production deployments are blocked with `productionDeploymentBlocker` enabled
- Deployment is enabled only for the `v0/projectascup-4372-46a4e311` branch
- Main branch deployments are disabled

#### 2. **Build Configuration** (`next.config.ts`)
- Runtime environment checks prevent production builds
- Warnings logged for restricted deployments

#### 3. **Middleware** (`src/middleware.ts`)
- Validates request environment at runtime
- Blocks requests from production main branch deployments
- Returns 503 Service Unavailable for blocked deployments

#### 4. **Deployment Config** (`src/lib/deployment-config.ts`)
- Centralized deployment environment checks
- Provides utilities for environment validation
- Logs deployment status on application startup

#### 5. **Root Layout** (`src/app/layout.tsx`)
- Validates deployment environment on application load
- Throws error if deployed to production main branch

### Environment Variables

The following environment variables are checked:
- `NODE_ENV` - Application environment (development, production)
- `VERCEL_ENV` - Vercel environment (preview, production)
- `VERCEL_URL` - Deployment URL
- `VERCEL_GIT_COMMIT_REF` - Git branch name

### Allowed Deployments

✓ **Allowed:**
- Local development (`NODE_ENV=development`)
- Preview deployments (any branch except main)
- `VERCEL_ENV=preview` deployments

✗ **Blocked:**
- Production deployments from main branch
- `NODE_ENV=production` on main branch
- Direct production deployments

### Deployment Instructions

#### To Deploy to Preview:
```bash
git checkout v0/projectascup-4372-46a4e311
git push origin v0/projectascup-4372-46a4e311
# Preview deployment will be created automatically
```

#### To Merge to Main (Read-Only):
```bash
git checkout main
git pull origin main
# Main branch is for reference only - no production deployments
```

### Testing Deployment Configuration

Run locally:
```bash
npm run dev
```

Check deployment status:
```bash
npm run build
```

View deployment logs:
- Navigate to Vercel Dashboard
- Check build logs for deployment status messages

### Emergency Override

If you need to temporarily override restrictions for testing:
1. Set `VERCEL_BYPASS_DEPLOY_LOCK=true` (not recommended)
2. Contact team lead for approval
3. Document the reason and duration

### Troubleshooting

**Error: "Production deployments are disabled"**
- Ensure you're on the `v0/projectascup-4372-46a4e311` branch
- Check that `VERCEL_GIT_COMMIT_REF` is not `main`

**Error: "Access denied" (503 Service Unavailable)**
- The application is running on production main branch
- Deploy to preview branch instead

**Build Fails with Deployment Warning**
- Check `NODE_ENV` is not set to `production`
- Verify `VERCEL_URL` contains "preview" or "localhost"
