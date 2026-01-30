# Commands

## Frontend (Next.js)

```bash
npm run dev

npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Run ESLint
```

## Backend (FastAPI)

```bash
uvicorn main:app --reload   # Start development server at localhost:8000
```

## Running Both Services

Start the backend first, then the frontend:

```bash
# Terminal 1 - Backend
uvicorn main:app --reload

# Terminal 2 - Frontend
npm run dev
```

Visit `http://localhost:3000` to use the application.

## API Connection Test

```bash
curl http://localhost:3000            # Test frontend
curl http://localhost:8000            # Test backend
curl http://localhost:3000/api/health # Test frontend-to-backend connection
```
