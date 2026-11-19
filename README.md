# EstateHub: Real Estate Platform API

The REST API behind EstateHub, a property marketplace for Bangladesh. Buyers search and save listings, message agents, book viewings and pay a booking fee with bKash. Agents publish and manage listings, and admins moderate the whole platform.

- **Live API:** _add your Render URL here_
- **Frontend:** see `../Real-Estate-Frontend`
- **API reference:** [docs/API.md](docs/API.md) · **Postman:** [docs/EstateHub-API.postman_collection.json](docs/EstateHub-API.postman_collection.json)
- **Requirement checklist:** [docs/BACKEND_CHECKLIST.md](docs/BACKEND_CHECKLIST.md)

## Features

| Area | What it does |
|---|---|
| Auth | Register (user or agent), login, Google sign-in, JWT access and refresh tokens with rotation and reuse detection, logout, change password, forgot/reset password with an emailed OTP, rate-limited auth routes |
| Roles | `USER` (buyer/renter), `AGENT` (seller/agent), `ADMIN`, enforced by `auth(...roles)` middleware and ownership checks in services |
| Users | Profile update with photo upload (Cloudinary); admins can list, block and soft-delete users |
| Agents | Public agent directory and profiles with ratings and closed deals; agency profile editing; admin verification |
| Properties | Full CRUD with 1–10 images; types APARTMENT, HOUSE, LAND, COMMERCIAL; purpose SALE or RENT; market status; admin approval workflow (pending, approved or rejected, with a reason); featured listings |
| Search | Text search, filters (type, purpose, price range, area range, division, city, area, bedrooms, bathrooms, amenities, furnishing, featured), sorting, pagination, field limiting, filter options endpoint |
| Favorites | Save and unsave listings, list them, and fetch the IDs for heart icons |
| Inquiries | Buyer-to-agent message threads with replies and statuses (NEW, IN_PROGRESS, RESOLVED, CLOSED) |
| Viewings | Request, approve, reject, reschedule, cancel and complete, with a strict status-transition map |
| Reviews | Property and agent reviews (only after a real interaction), cached average ratings recalculated in the same transaction, admin moderation, testimonials |
| Bookings and payments | Booking fee via **bKash tokenized checkout**. The callback confirms the booking, the payment and the property status in one DB transaction. Unpaid bookings auto-cancel after one hour |
| Notifications | In-app notifications plus HTML emails for new inquiries, replies, viewing changes, listing approval and payment success |
| Content | Contact form (stored), newsletter subscriptions and blog posts with categories |
| Dashboards | Admin, agent and user overview totals, plus 12-month chart series (line, bar and pie data) and recent activity |

## Tech stack

Express 5 · TypeScript (strict) · PostgreSQL · Prisma 7 · Zod 4 · JWT · bcrypt · Redis · Cloudinary + Multer · Nodemailer + EJS · bKash · node-cron · helmet · express-rate-limit · tsup · Biome

## Project structure

The structure follows the conventions of the reference project (`university-management-backend`).

```
prisma/
  schema/                 one .prisma file per domain (user, property, engagement, booking, content, enums)
  migrations/
  seed.ts                 realistic demo data (npm run seed)
  seed-data/              listings, people, activity, blog posts and image catalog
src/
  server.ts               connects DB, Redis and SMTP, seeds demo accounts, starts cron jobs and HTTP
  app.ts                  helmet, CORS whitelist, parsers, sanitizer, rate limit, routes, error handlers
  app/
    config/               typed env config (required variables fail fast)
    routes/               mounts every module under /api/v1
    middleware/           checkAuth, validateRequest, globalErrorHandler, notFound, rateLimiter, sanitizeInput, parseFormData
    lib/                  prisma, redis, cloudinary, multer, nodemailer, googleAuth, bkash, cron
    utils/                AppError, catchAsync, sendResponse, jwt, hashToken, uploadToCloudinary, sendEmail, logger, seed
    helper/               pagination, slug and transaction ID helpers
    interfaces/           shared query/meta types
    templates/            EJS email templates
    module/<name>/        <name>.route.ts · .controller.ts · .service.ts · .validation.ts · .interface.ts (+ .utils.ts)
```

Modules: `auth`, `user`, `agent`, `property`, `favorite`, `inquiry`, `viewing`, `review`, `booking`, `payment`, `notification`, `contact`, `newsletter`, `blog`, `dashboard`.

## Getting started

### Prerequisites

- Node.js 22 or newer and npm 10 or newer
- PostgreSQL 14 or newer (local, or a hosted database such as Neon, Supabase or Prisma Postgres)
- Redis (local, or a hosted service such as Redis Cloud or Upstash)
- Accounts for Cloudinary (image uploads), a Gmail app password (email) and bKash sandbox merchant credentials (payments)

### Setup

```bash
npm install                 # also runs "prisma generate"
cp .env.example .env        # then fill in your values
npm run db:migrate          # create the tables
npm run seed                # optional: load realistic demo data
npm run dev                 # http://localhost:5000
```

On npm 11 or newer, install scripts are allowed through the `allowScripts` field in `package.json`. That covers bcrypt, Prisma and esbuild.

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start in watch mode with tsx |
| `npm run build` | Bundle to `dist/` with tsup |
| `npm start` | Run the production build |
| `npm run db:migrate` | Create and apply a migration (development) |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run seed` | **Wipe** the database and load demo data. Needs `-- --force` when `NODE_ENV=production` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint:check` / `lint:fix` | Biome lint |
| `npm run format:check` / `format:fix` | Biome format |

## Environment variables

See [.env.example](.env.example) for the full list with comments.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | yes | Token signing secrets (use long random strings) |
| `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | no | Token lifetimes (default `1d` / `7d`) |
| `NODE_ENV`, `PORT` | no | `development` or `production`; port (default 5000) |
| `FRONTEND_URL` | no | Comma-separated CORS whitelist. The first entry is used for payment redirects |
| `BACKEND_URL` | no | Public URL of this API |
| `BCRYPT_SALT_ROUNDS` | no | Default 12 |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_USER`, `REDIS_PASSWORD` | yes for OTP and bKash | Redis connection |
| `SMTP_USER`, `SMTP_PASSWORD` | for email | Gmail address and app password |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | for uploads | Image storage |
| `BKASH_BASE_URL`, `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_USERNAME`, `BKASH_PASSWORD` | for payments | bKash tokenized checkout credentials |
| `BKASH_CALLBACK_URL` | for payments | Public API base incl. `/api/v1`, e.g. `https://api.example.com/api/v1` |
| `GOOGLE_CLIENT_ID` | optional | Enables `POST /auth/google` |
| `DEMO_*` | for the demo | Name, email and password of the demo admin, agent and user |

## Demo accounts

Demo accounts are created on startup (if missing) and by `npm run seed`, using the `DEMO_*` values.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@estatehub.test` | `Admin@12345` |
| Agent | `agent@estatehub.test` | `Agent@12345` |
| User | `user@estatehub.test` | `User@12345` |

The seed also creates 6 more agents and 12 buyers, all with the password `Estate@2026`. It adds 40 listings across 9 Bangladeshi cities, plus bookings, payments, viewings, inquiry threads, reviews, favorites, notifications, contact messages, newsletter subscribers and 7 blog posts, spread over the last 12 months so the dashboard charts have real data.

Seeded emails use reserved domains (`.test`, `example.com`), and the mailer skips them, so no real inbox receives mail. Seeded photos are free Unsplash images, referenced with `external:` public IDs so they are never sent to Cloudinary for deletion. Replace them by uploading through the API.

## API overview

All routes are served under `/api/v1`. Full details are in [docs/API.md](docs/API.md).

| Group | Base path | Endpoints |
|---|---|---|
| Auth | `/auth` | register, login, google, refresh-token, logout, me, change-password, forgot-password, reset-password |
| Users | `/users` | `PATCH /me`, admin list, details, status, delete |
| Agents | `/agents` | list, profile, `PATCH /me`, verify |
| Properties | `/properties` | search, filter-options, my-properties, admin/all, details, related, create, update, status, approval, featured, delete |
| Favorites | `/favorites` | list, ids, add, remove |
| Inquiries | `/inquiries` | create, my, agent, all, details, replies, status |
| Viewings | `/viewings` | create, my, agent, all, status, reschedule, cancel |
| Reviews | `/reviews` | by target, testimonials, my, all, create, update, visibility, delete |
| Bookings | `/bookings` | create, my, agent, all, details, cancel |
| Payments | `/payments` | bkash/create, bkash/callback, my-payments, agent-payments, all-payments, details |
| Notifications | `/notifications` | list, read-all, read, delete |
| Contact | `/contacts` | submit, admin list, status, delete |
| Newsletter | `/newsletter` | subscribe, admin list, delete |
| Blog | `/blogs` | list, categories, admin/all, admin/:id, by slug, create, update, delete |
| Dashboard | `/dashboard` | public-stats, admin, agent, user |

Response shape: `{ success, statusCode, message, data, meta? }`. Errors: `{ success: false, statusCode, name, message }`.

## Payments (bKash sandbox)

1. `POST /bookings` creates a `PENDING_PAYMENT` booking for the listing's booking fee.
2. `POST /payments/bkash/create` returns `paymentURL`. The frontend redirects the browser there.
3. The buyer pays with a bKash sandbox test wallet (see the bKash developer portal for the current test numbers, OTP and PIN).
4. bKash redirects to `GET /payments/bkash/callback`. The API executes the payment (falling back to a status query if execute fails) and then runs one database transaction that:
   - marks the payment `SUCCESS`
   - confirms the booking
   - sets the property to `PENDING`
   - cancels other unpaid bookings for that property

   The user and agent are then notified, and the user gets an email. The browser lands on `FRONTEND_URL/payment/success|failed|cancelled?transactionId=…`.

The callback is idempotent, and the amount bKash reports must match the stored amount. Unpaid bookings are cancelled by a cron job after one hour.

## Security

- bcrypt password hashing, and refresh tokens stored only as SHA-256 hashes with rotation and reuse detection
- httpOnly cookies (`secure` and `SameSite=None` in production), plus support for Bearer tokens
- helmet security headers, a CORS whitelist and rate limits (auth: 20 per 15 minutes in production; public forms: 10 per hour; API: 600 per 15 minutes)
- Zod validation for every body, query string and URL parameter, plus input sanitization (HTML tags, null bytes and prototype-pollution keys removed)
- Role-based middleware plus ownership checks in services, and soft deletes for users and listings
- Upload type and size limits, and secrets only in `.env`

## Deployment (Render)

1. Create a PostgreSQL database (Render, Neon or Supabase) and a Redis instance (Render Key Value, Redis Cloud or Upstash).
2. Create a **Web Service** from this folder with these settings:
   - **Build command:** `npm install && npm run build && npm run db:deploy`
   - **Start command:** `npm start`
3. Add every variable from `.env.example` with production values:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-frontend.vercel.app`
   - `BACKEND_URL` and `BKASH_CALLBACK_URL` pointing at the Render URL
4. Optionally load the demo data once from the Render shell with `npm run seed -- --force`. This wipes the database.

A long-running service is recommended rather than serverless functions, because the API keeps a Redis connection, runs cron jobs and renders email templates from disk.
