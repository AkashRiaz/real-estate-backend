# Backend requirement checklist (Phase 1)

Legend: ✅ done and tested against the running API · ⚠️ done with a noted difference · ⏳ needs action from the project owner

## Decisions that differ from the requirements doc

| Doc says | Implemented | Why |
|---|---|---|
| Express + **MongoDB** | Express + **PostgreSQL / Prisma 7** | Project owner chose to match the reference project's stack |
| `server/index.js, routes/, controllers/, middleware/, config/` | `src/app/module/<name>/<name>.route/controller/service/validation/interface.ts` + `config/`, `middleware/`, `routes/` | Project owner chose the reference project's modular layout (satisfies "basic modular structure") |
| Payment gateway not specified | bKash tokenized checkout | Project owner's choice (same as reference) |
| AI features | None | Not required for a real estate project; owner confirmed |

## Requirements doc

### 6. Authentication
| Requirement | Status | Where |
|---|---|---|
| Login / registration endpoints | ✅ | `module/auth/auth.route.ts` |
| Password validation | ✅ | `auth.validation.ts` → `passwordZodSchema` (8+ chars, upper, lower, number, special) |
| Proper error handling | ✅ | `AppError` + `globalErrorHandler.ts` (401 / 403 / 409 / 429 with clear messages) |
| JWT-based authentication | ✅ | `utils/jwt.ts`, `auth.utils.ts → generateAuthTokens` |
| Protected routes and role-based middleware | ✅ | `middleware/checkAuth.ts → auth(...roles)`; ownership checks in services |
| Roles: User and Admin (+ Agent) | ✅ | `enums.prisma → Role { USER, AGENT, ADMIN }` |
| Demo login (one account per role) | ✅ | `utils/seed.ts → seedDemoAccounts` (startup) and `prisma/seed.ts`; credentials in README |
| bcrypt hashing | ✅ | `auth.service.ts`, `seed.ts` |
| Token expiration handling | ✅ | Access/refresh expiry from env; `POST /auth/refresh-token` with rotation + reuse detection; cron cleanup of expired tokens |
| Google login (bonus) | ✅ | `POST /auth/google` (needs `GOOGLE_CLIENT_ID`) |

### 7. Role-based dashboard (backend data)
| Requirement | Status | Where |
|---|---|---|
| Overview cards with dynamic data | ✅ | `GET /dashboard/admin`, `/agent`, `/user` → `totals` |
| Bar, line and pie chart data | ✅ | `dashboard.service.ts` → 12-month series filled with zeros + group-by breakdowns |
| Tables with pagination, filtering, sorting | ✅ | Every list endpoint: `page/limit/sortBy/sortOrder` + filters, `meta` in response |
| Profile: editable info, image upload, password update | ✅ | `PATCH /users/me` (multipart), `POST /auth/change-password` |

### 8. Contact page
| Requirement | Status | Where |
|---|---|---|
| Working form, data stored in DB, validation + success message | ✅ | `POST /contacts` → `contact_messages` table; admin management endpoints |

### 9. Backend requirements
| Requirement | Status | Where |
|---|---|---|
| Express | ✅ | Express 5 |
| MongoDB | ⚠️ | PostgreSQL + Prisma (owner decision, see above) |
| Modular structure, route separation | ✅ | `src/app/module/*`, `src/app/routes/index.ts` |
| Centralized error handling | ✅ | `middleware/globalErrorHandler.ts` (Prisma, Zod, Multer, JSON, AppError) |
| Proper status codes | ✅ | 200/201/302/400/401/403/404/409/429/5xx (see docs/API.md) |
| Schema planning and relationships | ✅ | `prisma/schema/*.prisma` (16 models, FK relations, cascades, unique constraints) |
| Password hashing | ✅ | bcrypt |
| Input validation | ✅ | Zod on every body, query and params (`validateRequest(schema, "body" \| "query" \| "params")`) |
| CORS configuration | ✅ | Whitelist from `FRONTEND_URL` (`app.ts`); unknown origins are rejected |
| Role-based access control | ✅ | `auth(...roles)` + service-level ownership checks |

### 10–12. Performance, code quality, deployment (backend part)
| Requirement | Status | Where |
|---|---|---|
| Image optimization | ✅ | Cloudinary upload with a 1600px width limit, `quality:auto`, `format:auto`; 5 MB limit |
| Production-ready build | ✅ | `npm run build` (tsup) → `npm start` |
| Clean structure, reusable helpers | ✅ | `catchAsync`, `sendResponse`, `AppError`, `calculatePagination`, `buildPropertyFilters`, `recalculateRatings`, `createNotification` |
| Proper env usage | ✅ | `config/index.ts` (required variables fail fast), `.env.example` |
| No console logs in production | ✅ | `utils/logger.ts` silences info logs in production; no `console.*` elsewhere |
| TypeScript strict, lint clean | ✅ | `npm run typecheck` and `npm run lint:check` pass |
| Meaningful commits | ⏳ | Folder is not a git repository yet. Run `git init` and commit when ready |
| Backend deployed | ⏳ | Needs your Render, PostgreSQL and Redis accounts; steps in README → Deployment |
| No localhost in production | ✅ | All URLs come from env (`FRONTEND_URL`, `BACKEND_URL`, `BKASH_CALLBACK_URL`) |

## Real estate feature list (task prompt §4)

| # | Feature | Status | Endpoints |
|---|---|---|---|
| 1 | Auth: register, login, logout, access + refresh, change/forgot/reset password, RBAC | ✅ | `/auth/*` |
| 2 | Users: profile view/update, photo, admin block/delete | ✅ | `/auth/me`, `/users/*` |
| 3 | Properties CRUD + multi-image upload, all listed fields, approval workflow | ✅ | `/properties/*` |
| 4 | Search, filters (type, purpose, price, location, bedrooms, amenities), sort, pagination, field limiting | ✅ | `GET /properties`, `/properties/filter-options` |
| 5 | Favorites | ✅ | `/favorites/*` |
| 6 | Inquiries with agent reply and status | ✅ | `/inquiries/*` |
| 7 | Viewings: request, approve, reschedule, cancel, status | ✅ | `/viewings/*` |
| 8 | Reviews for properties and agents | ✅ | `/reviews/*` |
| 9 | Payments (bKash), transactions and status stored | ✅ | `/bookings/*`, `/payments/*` |
| 10 | Dashboard stats (admin totals and charts, agent listings, inquiries and bookings) | ✅ | `/dashboard/*` |
| 11 | Notifications and email for inquiry, viewing status and payment success | ✅ | `/notifications/*` + `utils/sendEmail.ts`, `templates/*.ejs` |
| 12 | AI features | n/a | Not required (owner confirmed) |

## Best practices (task prompt §5)

| Practice | Status | Notes |
|---|---|---|
| TypeScript strict, no `any` | ✅ | `strict: true`; no explicit `any` in source |
| Validate body, query and params | ✅ | `validateRequest` on every route with input |
| Password hashing, rate limiting on auth, helmet, CORS whitelist, sanitization, secrets in .env | ✅ | `rateLimiter.ts`, `helmet()`, `sanitizeInput.ts`, `config/index.ts` |
| Indexes on searched and filtered fields | ✅ | `@@index` on type, purpose, price, division, city, area, bedrooms, status, approvalStatus, isFeatured, agentId, createdAt + composite |
| Transactions for multi-step writes | ✅ | Payment completion, booking cancel, review + rating recalculation, property update with images, user block/delete |
| `.env.example`, consistent errors and status codes | ✅ | |
| Seed with realistic data + one demo account per role | ✅ | `npm run seed` |
| API documentation / Postman | ✅ | `docs/API.md` (91 endpoints), `docs/EstateHub-API.postman_collection.json` |

## Verification log

Each module was exercised end to end against PostgreSQL 18, Redis, Cloudinary, Gmail SMTP and the bKash sandbox:

- **Auth:** register (including role and validation rules), login, `/me` by cookie and bearer, refresh rotation, reuse detection revoking all sessions, change password, OTP reset with attempt limit, logout.
- **Users and agents:** profile photo upload to Cloudinary, admin block (blocked tokens rejected immediately), self-protection, agent verify.
- **Properties:** create with real uploads, the pending → approved and rejected flow with email, featured only when approved, status and purpose rules, content edits returning a listing to review, cover and image removal rules, cross-agent 403, filters, sorting, field limiting, pagination, related listings, filter options.
- **Favorites, inquiries, viewings:** duplicate guards, ownership 403s, the status-transition map, notifications.
- **Reviews:** an interaction is required, duplicate gives 409, ratings recalculated on create, update, hide and delete.
- **Bookings and payments:** bKash sandbox checkout URL created; callback paths for cancel, failure, unknown ID and unpaid all redirect correctly; the success transaction was verified directly (amount mismatch rejected, idempotent, booking confirmed, property set to PENDING, competing unpaid booking cancelled, both notifications).
- **Contact, newsletter, blog, dashboards:** verified on seeded data.

**Not verified:** a full bKash payment through the sandbox web page, because it needs a person to enter the test wallet PIN in a browser. The server-side logic after that step is covered by the direct test.
