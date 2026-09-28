# CAT 2025 IIM Interview-Call Predictor

Production-oriented Next.js application that estimates CAT 2025 interview-call chances across all 21 IIMs for the 2026–28 intake. It applies institute-specific eligibility gates, CAT cutoffs, academic/profile rules, shortlist scores, and clearly labelled call benchmarks. It does not calculate or display final-seat probability.

## What is included

- Basic degree, age, duration and provisional final-year eligibility
- All category/PwD CAT overall, sectional and positive raw-score gates
- Explicit AC-1 Part I, AC-1 Part II and AC-2 through AC-6 selection
- Complete AC-specific Application Rating tables and professional-score handling
- C1–C6, academic consistency and observed CAT-2025 graduation filters
- Separate Stage 1 and Stage 2 shortlist engines
- Shortlist CS, required CAT scaled score and threshold gap
- Historical shortlist references and model call thresholds where an official current-cycle shortlist boundary is unavailable
- High, medium, and low interview-call chance bands
- Explanation panel and source/assumption classification
- Versioned PostgreSQL configuration, degree mappings and immutable prediction snapshots
- Zod API validation, Vitest rule coverage and Playwright E2E coverage

## Stack

Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI, Zod, Prisma, PostgreSQL, Vitest and Playwright.

## Run locally

Prerequisites: Node.js 20+, pnpm, Docker Desktop (for persistence).

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

Open `http://localhost:3000`.

The calculation engine and predictor also run without a database. If `DATABASE_URL` is absent, prediction responses state that persistence was skipped. Set `PERSIST_PREDICTIONS=true` in production to make persistence failures fatal.

## Admin configuration

Set a long random `ADMIN_TOKEN` in `.env`. Open `/admin`, enter the token and load the active policy. The versioned policy stores eligibility, cutoff, academic-category, and shortlist configuration. The degree-mapping editor writes explicit degree-to-AC mappings.

Saving a policy version does not update old predictions: each `PredictionRun` stores the complete candidate input, policy version, policy snapshot and result snapshot.

## API

`POST /api/iima/predict` accepts either the flat candidate object shown below or `{ "candidate": { ... }, "poolContext": { ... } }`.

```json
{
  "category": "GENERAL",
  "pwd": false,
  "gender": "MALE",
  "dateOfBirth": "2003-05-12",
  "finalYearStudent": false,
  "degreeName": "B.Tech Computer Science",
  "degreeDurationYears": 4,
  "class10Percent": 92,
  "class12Percent": 90,
  "class12Stream": "SCIENCE",
  "academicCategory": "AC_4",
  "bachelorPercent": 86,
  "professionalQualification": "NONE",
  "workExperienceMonths": 24,
  "catOverallPercentile": 99.5,
  "catVarcPercentile": 95,
  "catDilrPercentile": 95,
  "catQaPercentile": 95,
  "catOverallScaledScore": 150,
  "positiveRawVarc": true,
  "positiveRawDilr": true,
  "positiveRawQa": true
}
```

Invalid percentages, percentiles, scaled scores and work-experience values return HTTP 422 with field paths. Numeric comparisons are never rounded before threshold checks.

## Quality commands

```bash
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm lint
pnpm build
```

Playwright browsers are installed once with:

```bash
pnpm exec playwright install chromium
```

## Project map

```text
src/app/                 Next.js pages and API routes
src/components/          Predictor, results, admin and accessible UI
src/lib/iima/            Versioned policy and pure calculation engine
src/lib/validation/      Zod request and policy validation
src/types/               Domain types
prisma/                  PostgreSQL schema and seed data
tests/unit/              Boundary and orchestration tests
tests/e2e/               Desktop/mobile user-flow tests
docs/                    Formula and sample-prediction documentation
screenshots/             Verified desktop/mobile UI captures
```

## Important disclosure

This tool predicts interview-call chances only and is not affiliated with any IIM. Clearing published eligibility and CAT minimums does not guarantee a call because institutes can shortlist by category, profile score, and the current applicant pool. Historical or model shortlist thresholds and the displayed high/medium/low bands are predictive references, not official call letters or admission guarantees.
