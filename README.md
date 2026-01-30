# Data Transform Engine Frontend

![CI](https://github.com/obj809/frontend-data-transform-engine/actions/workflows/ci.yml/badge.svg)

Next.js frontend for file processing and data transformation operations.

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

## Commands

| Command            | Description      |
| ------------------ | ---------------- |
| `npm run dev`      | Start dev server |
| `npm run build`    | Production build |
| `npm run lint`     | Run ESLint       |
| `npm test`         | Run unit tests   |
| `npm run test:e2e` | Run E2E tests    |

## Backend

Requires the FastAPI backend running on port 8000:

```bash
uvicorn main:app --reload
```
