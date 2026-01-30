# Data Transform Engine Frontend

![CI](https://github.com/obj809/frontend-data-transform-engine/actions/workflows/ci.yml/badge.svg)
[![Deploy](https://img.shields.io/github/deployments/obj809/frontend-data-transform-engine/production?label=vercel&logo=vercel)](https://frontend-data-transform-engine.vercel.app)

Next.js frontend for file processing and data transformation operations.

**Live:** [frontend-data-transform-engine.vercel.app](https://frontend-data-transform-engine.vercel.app)

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4
- Jest + Playwright for testing

## Getting Started

```bash
npm install
npm run dev
```

Runs at [http://localhost:3000](http://localhost:3000).

### Environment

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Pre-push Hook (Optional)

Run CI checks automatically before each push:

```bash
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
./scripts/ci-local.sh
EOF
chmod +x .git/hooks/pre-push
```

## Commands

| Command                 | Description               |
| ----------------------- | ------------------------- |
| `npm run dev`           | Start dev server          |
| `npm run build`         | Production build          |
| `npm run lint`          | Run ESLint                |
| `npm run typecheck`     | Run TypeScript checks     |
| `npm run format:check`  | Check Prettier format     |
| `npm test`              | Run unit tests            |
| `npm run test:e2e`      | Run E2E tests             |
| `./scripts/ci-local.sh` | Run all CI checks locally |

## Backend

Requires the FastAPI backend running on port 8000:

```bash
uvicorn main:app --reload
```
