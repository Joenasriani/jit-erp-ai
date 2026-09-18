# JIT-ERP Generator

JIT-ERP Generator is a prototype that turns a plain-language business workflow into a structured application specification, then asks Gemini to generate reviewable source code for a small web application.

## Implemented flow

**business problem → structured problem card → human review → generated prototype code**

The problem card can contain:

- entities and fields
- entity relationships
- application actions
- proposed role/action policies
- compliance considerations supplied by the user or inferred by the model

After review, the generator requests:

- a React + TypeScript frontend
- either NestJS + Prisma or FastAPI + SQLAlchemy backend code
- a PostgreSQL-oriented data model

Generated files are displayed for inspection and copying. The repository does not automatically deploy the generated application.

## Evidence boundary

This is a code-generation prototype, not a production ERP system.

The generated output does **not** establish:

- working authentication or authorization
- implemented role-based access control
- regulatory compliance or certification
- production security
- complete test coverage
- successful deployment
- correctness of generated business logic

The generation prompt explicitly treats authentication and authorization as outside the current prototype. Any policies or compliance standards shown in the problem card are design inputs or considerations, not proof that the generated application implements or satisfies them.

## Security architecture

Gemini requests are routed through server-side API functions under `/api`. The browser does not receive the repository's Gemini API key.

Set `GEMINI_API_KEY` only in the server/runtime environment. Do not expose it through Vite client variables or commit it to the repository.

The current prototype does not implement user authentication, durable rate limiting, quotas, or billing controls for the generation endpoints. Those controls are required before operating a public production service.

## Local development

Prerequisites:

- Node.js
- a Gemini API key
- Vercel CLI for the full frontend + serverless API flow

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

3. Set `GEMINI_API_KEY` in `.env.local`.

4. Run the full application with a local Vercel runtime:

   ```bash
   npx vercel dev
   ```

`npm run dev` starts the Vite frontend only; the `/api` generation endpoints require a compatible serverless runtime.

## Public deployment status

No working public deployment was verified during the 2026-09-18 repository audit. A previously configured deployment URL returned `404 DEPLOYMENT_NOT_FOUND`, so it should not be treated as the canonical public application.

## Stack

- React
- TypeScript
- Vite
- Gemini API via `@google/genai`
- Vercel-style serverless API functions
