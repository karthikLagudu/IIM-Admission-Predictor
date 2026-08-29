# IIM Admission Predictors

Production-oriented Next.js application for IIM Ahmedabad PGP 2026–28 admissions through CAT 2025. It implements official gates and formulas as a deterministic rules engine, then applies an explicitly labelled historical/logistic model only because IIMA does not publish a fixed current final category-wise FCS cutoff.

It also contains a fully separate **IIM Bangalore Undergraduate Admission Predictor for 2027–31** at `/iimb-ug`. The UG engine covers exact eligibility and raw scoring, historical benchmark context, transparent Pre-PI and Post-PI planning, PI target solving, programme preferences, readiness, source provenance, and typed `DATA_REQUIRED` states. It never reuses the MBA/CAT engine and does not fabricate current cutoffs or admission probability.

## What is included

- Basic degree, age, duration and provisional final-year eligibility
- All category/PwD CAT overall, sectional and positive raw-score gates
- Explicit AC-1 Part I, AC-1 Part II and AC-2 through AC-6 selection
- Complete AC-specific Application Rating tables and professional-score handling
- C1–C6, academic consistency and observed CAT-2025 graduation filters
- Separate Stage 1 and Stage 2 shortlist engines
- Shortlist CS, required CAT scaled score and threshold gap
- Official final FCS formula and required normalized PI solver
- Three-cycle historical calibration, editable planning margin, gated logistic ensemble, scenario range and interpretation band
- Sensitivity analysis and live CAT/PI/AWT simulator
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

Set a long random `ADMIN_TOKEN` in `.env`. Open `/admin`, enter the token and load the active policy. The complete JSON editor supports all rule groups, while quick controls expose the model safety margin and logistic slope. Recency weights and the three-cycle benchmark series are versioned in the same policy. The degree-mapping editor writes explicit degree-to-AC mappings.

Saving a policy version does not update old predictions: each `PredictionRun` stores the complete candidate input, policy version, policy snapshot and result snapshot.

The independent UG administrator is at `/admin/iimb-ug`. Its policy and runtime-data editors require `ADMIN_TOKEN`; saving requires a new version identifier. `IimbUgPredictionRun` stores immutable candidate, policy, runtime, and result snapshots. UG policy, runtime, historical cycles, and source records have separate Prisma models.

## IIMB UG API

`POST /api/iimb-ug/predict` accepts `{ candidate, calculationMode, targetFinalComposite }`. Candidate test input may use complete correct/wrong/unattempted counts or a raw-score route. Invalid inputs return HTTP 422. Missing means, standard deviations, current thresholds, or programme allocation data return typed domain states and do not become HTTP errors.

Protected version APIs are `GET|POST /api/iimb-ug/policy` and `GET|POST /api/iimb-ug/runtime`.

The source and formula audit is documented in:

- `docs/IIMB_UG_2027_POLICY.md`
- `docs/IIMB_UG_FORMULAS.md`
- `docs/IIMB_UG_SOURCES.md`
- `docs/IIMB_UG_ASSUMPTIONS.md`
- `docs/IIMB_UG_TEST_CASES.md`

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
  "positiveRawQa": true,
  "normalizedPi": 0.75,
  "normalizedAwt": 0.75
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

This tool does not guarantee admission and is not affiliated with IIM Ahmedabad. IIMA final admission depends on the actual candidate pool, category-wise merit, interview performance, reservation, seat availability and institute decisions. Historical FCS values, recency weights, the safety margin, logistic slope, probabilities and display bands are predictive inputs—not official IIMA cutoffs or categories. The probability range is a historical scenario range, not a formal confidence interval.
