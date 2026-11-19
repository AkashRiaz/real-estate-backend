# EstateHub API reference

Base URL: `{BACKEND_URL}/api/v1` (local: `http://localhost:5000/api/v1`)

## Conventions

**Authentication.** Send `Authorization: Bearer <accessToken>`, or rely on the httpOnly `accessToken` cookie set by login/register. Access tokens expire after `JWT_ACCESS_EXPIRES_IN`; call `POST /auth/refresh-token` to get a new pair.

**Roles.** `USER` (buyer/renter), `AGENT` (seller/agent), `ADMIN`. "Public" endpoints need no token.

**Success response**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Properties retrieved successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 37,
    "totalPages": 4
  }
}
```

**Error response** (`error` and `stack` are only included when `NODE_ENV=development`)
```json
{
  "success": false,
  "statusCode": 400,
  "name": "Request Error",
  "message": "price: Price must be greater than 0"
}
```

**Status codes.** 200 OK · 201 Created · 302 Redirect (bKash callback) · 400 Validation error · 401 Not logged in / bad token · 403 Wrong role, blocked or not allowed · 404 Not found · 409 Conflict (duplicate) · 429 Rate limited · 5xx Server error.

**Validation.** Every body, query string and URL param is validated with Zod. Unknown enum values, malformed IDs and wrong types return 400 with field-level messages.

**Pagination.** List endpoints accept `page` (default 1) and `limit` (default 12, max 100) and return `meta: { page, limit, total, totalPages }`.

**File uploads.** multipart/form-data with the JSON payload in a `data` field and the image files in their own fields. Images: JPG, PNG, WEBP or AVIF, 5 MB max each. They are stored on Cloudinary and resized to a maximum width of 1600 px.

**Money.** Prices are in BDT and returned as decimal strings, for example `"52000000"`.

## Endpoint summary

| Method | Endpoint | Role |
|---|---|---|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/google` | Public |
| POST | `/auth/refresh-token` | Public |
| POST | `/auth/logout` | Public |
| GET | `/auth/me` | Any logged-in |
| POST | `/auth/change-password` | Any logged-in |
| POST | `/auth/forgot-password` | Public |
| POST | `/auth/reset-password` | Public |
| PATCH | `/users/me` | Any logged-in |
| GET | `/users` | ADMIN |
| GET | `/users/:id` | ADMIN |
| PATCH | `/users/:id/status` | ADMIN |
| DELETE | `/users/:id` | ADMIN |
| GET | `/agents` | Public |
| GET | `/agents/:id` | Public |
| PATCH | `/agents/me` | AGENT |
| PATCH | `/agents/:id/verify` | ADMIN |
| GET | `/properties` | Public |
| GET | `/properties/filter-options` | Public |
| GET | `/properties/my-properties` | AGENT, ADMIN |
| GET | `/properties/admin/all` | ADMIN |
| GET | `/properties/:idOrSlug` | Public (optional auth) |
| GET | `/properties/:id/related` | Public |
| POST | `/properties` | AGENT, ADMIN |
| PATCH | `/properties/:id` | Owner AGENT, ADMIN |
| PATCH | `/properties/:id/status` | Owner AGENT, ADMIN |
| PATCH | `/properties/:id/approval` | ADMIN |
| PATCH | `/properties/:id/featured` | ADMIN |
| DELETE | `/properties/:id` | Owner AGENT, ADMIN |
| GET | `/favorites` | USER |
| GET | `/favorites/ids` | USER |
| POST | `/favorites` | USER |
| DELETE | `/favorites/:propertyId` | USER |
| POST | `/inquiries` | USER |
| GET | `/inquiries/my` | USER |
| GET | `/inquiries/agent` | AGENT |
| GET | `/inquiries` | ADMIN |
| GET | `/inquiries/:id` | Participant, ADMIN |
| POST | `/inquiries/:id/replies` | Buyer or agent |
| PATCH | `/inquiries/:id/status` | Listing AGENT, ADMIN |
| POST | `/viewings` | USER |
| GET | `/viewings/my` | USER |
| GET | `/viewings/agent` | AGENT |
| GET | `/viewings` | ADMIN |
| PATCH | `/viewings/:id/status` | Listing AGENT, ADMIN |
| PATCH | `/viewings/:id/reschedule` | Listing AGENT, ADMIN |
| PATCH | `/viewings/:id/cancel` | Buyer or agent |
| GET | `/reviews` | Public |
| GET | `/reviews/testimonials` | Public |
| GET | `/reviews/my` | USER |
| GET | `/reviews/all` | ADMIN |
| POST | `/reviews` | USER |
| PATCH | `/reviews/:id` | Author |
| PATCH | `/reviews/:id/visibility` | ADMIN |
| DELETE | `/reviews/:id` | Author, ADMIN |
| POST | `/bookings` | USER |
| GET | `/bookings/my` | USER |
| GET | `/bookings/agent` | AGENT |
| GET | `/bookings` | ADMIN |
| GET | `/bookings/:id` | Buyer, agent, ADMIN |
| PATCH | `/bookings/:id/cancel` | USER (unpaid only), ADMIN |
| POST | `/payments/bkash/create` | USER |
| GET | `/payments/bkash/callback` | bKash redirect |
| GET | `/payments/my-payments` | USER |
| GET | `/payments/agent-payments` | AGENT |
| GET | `/payments/all-payments` | ADMIN |
| GET | `/payments/:paymentId` | Payer, agent, ADMIN |
| GET | `/notifications` | Any logged-in |
| PATCH | `/notifications/read-all` | Any logged-in |
| PATCH | `/notifications/:id/read` | Any logged-in |
| DELETE | `/notifications/:id` | Any logged-in |
| POST | `/contacts` | Public |
| GET | `/contacts` | ADMIN |
| PATCH | `/contacts/:id/status` | ADMIN |
| DELETE | `/contacts/:id` | ADMIN |
| POST | `/newsletter/subscribe` | Public |
| GET | `/newsletter` | ADMIN |
| DELETE | `/newsletter/:id` | ADMIN |
| GET | `/blogs` | Public |
| GET | `/blogs/categories` | Public |
| GET | `/blogs/admin/all` | ADMIN |
| GET | `/blogs/admin/:id` | ADMIN |
| GET | `/blogs/:slug` | Public |
| POST | `/blogs` | ADMIN |
| PATCH | `/blogs/:id` | ADMIN |
| DELETE | `/blogs/:id` | ADMIN |
| GET | `/dashboard/public-stats` | Public |
| GET | `/dashboard/admin` | ADMIN |
| GET | `/dashboard/agent` | AGENT |
| GET | `/dashboard/user` | USER |

## Auth

### POST `/auth/register`

**Role:** Public

Create a USER or AGENT account. Sets auth cookies and returns tokens. Rate-limited.

**Body**

```json
{
  "name": "Rafi Ahmed",
  "email": "rafi@example.com",
  "password": "Strong@123",
  "phone": "01812345678",
  "role": "AGENT",
  "agencyName": "Ahmed Realty",
  "licenseNumber": "REHAB-DHK-2024-0101"
}
```

**Response:** 201 `{ accessToken, refreshToken, user }`

### POST `/auth/login`

**Role:** Public

Email + password login. Rate-limited.

**Body**

```json
{
  "email": "user@estatehub.test",
  "password": "User@12345"
}
```

**Response:** 200 `{ accessToken, refreshToken, user }`

### POST `/auth/google`

**Role:** Public

Google sign-in with a Google ID token (needs GOOGLE_CLIENT_ID).

**Body**

```json
{
  "idToken": "<google-id-token>"
}
```

**Response:** 200 `{ accessToken, refreshToken, user }`

### POST `/auth/refresh-token`

**Role:** Public

Rotates the refresh token (from the `refreshToken` cookie or body). Reusing an old token revokes every session.

**Body**

```json
{
  "refreshToken": "<optional if cookie is sent>"
}
```

**Response:** 200 `{ accessToken, refreshToken }`

### POST `/auth/logout`

**Role:** Public

Revokes the refresh token and clears cookies.

**Response:** 200 `null`

### GET `/auth/me`

**Role:** Any logged-in

Current user with agent profile.

**Response:** 200 `User`

### POST `/auth/change-password`

**Role:** Any logged-in

Changes the password, signs out other sessions and returns fresh tokens.

**Body**

```json
{
  "oldPassword": "User@12345",
  "newPassword": "NewPass@2026"
}
```

**Response:** 200 `{ accessToken, refreshToken }`

### POST `/auth/forgot-password`

**Role:** Public

Emails a 6-digit OTP (valid 5 minutes). Same response whether or not the email exists.

**Body**

```json
{
  "email": "user@estatehub.test"
}
```

**Response:** 200 `null`

### POST `/auth/reset-password`

**Role:** Public

Resets the password with the OTP. 5 wrong attempts invalidate the code.

**Body**

```json
{
  "email": "user@estatehub.test",
  "otp": "123456",
  "newPassword": "NewPass@2026"
}
```

**Response:** 200 `null`

## Users

### PATCH `/users/me`

**Role:** Any logged-in

Update own profile. multipart/form-data: `profileImage` (file, optional) + `data` (JSON).

**multipart/form-data**: files: `profileImage`; `data` field:

```json
{
  "name": "Nusrat Jahan",
  "phone": "01912345678",
  "removeImage": false
}
```

**Response:** 200 `User`

### GET `/users`

**Role:** ADMIN

List users.

**Query:** `searchTerm, role, status, page, limit, sortBy, sortOrder`

**Response:** 200 `User[]` + meta

### GET `/users/:id`

**Role:** ADMIN

User details with activity counts.

**Response:** 200 `User`

### PATCH `/users/:id/status`

**Role:** ADMIN

Block or unblock (blocking signs the user out everywhere).

**Body**

```json
{
  "status": "BLOCKED"
}
```

**Response:** 200 `User`

### DELETE `/users/:id`

**Role:** ADMIN

Soft-delete a user (an agent's listings are hidden too).

**Response:** 200 `User`

## Agents

### GET `/agents`

**Role:** Public

Active agents with listing counts.

**Query:** `searchTerm, area, isVerified, sortBy (rating|experience|listings|createdAt|name), sortOrder, page, limit`

**Response:** 200 `Agent[]` + meta

### GET `/agents/:id`

**Role:** Public

Agent profile, latest 8 listings, closed deals and rating breakdown.

**Response:** 200 `Agent`

### PATCH `/agents/me`

**Role:** AGENT

Update own agency profile.

**Body**

```json
{
  "agencyName": "Hasan Properties Ltd.",
  "bio": "Residential specialist in Gulshan and Banani.",
  "experienceYears": 9,
  "serviceAreas": [
    "Gulshan",
    "Banani"
  ]
}
```

**Response:** 200 `AgentProfile`

### PATCH `/agents/:id/verify`

**Role:** ADMIN

Verify or un-verify an agent.

**Body**

```json
{
  "isVerified": true
}
```

**Response:** 200 `AgentProfile`

## Properties

### GET `/properties`

**Role:** Public

Search approved listings. `bedrooms`/`bathrooms` mean "at least"; `amenities` is comma-separated (must have all); `fields` limits returned fields (e.g. `title,price,images`).

**Query:** `searchTerm, type, purpose, status, furnishing, division, city, area, minPrice, maxPrice, minArea, maxArea, bedrooms, bathrooms, amenities, isFeatured, agentId, fields, page, limit, sortBy (price|createdAt|areaSqft|avgRating|views|bedrooms), sortOrder`

Example: `/properties?type=APARTMENT&purpose=RENT&city=Dhaka&bedrooms=3&sortBy=price&sortOrder=asc`

**Response:** 200 `PropertyCard[]` + meta

### GET `/properties/filter-options`

**Role:** Public

Divisions/cities with counts, type counts, price and area range (for filter UIs).

**Response:** 200 `{ locations, types, priceRange, areaRange }`

### GET `/properties/my-properties`

**Role:** AGENT, ADMIN

Own listings in every approval state, with inquiry/viewing/favorite counts.

**Query:** `same filters as public search + approvalStatus`

**Response:** 200 `PropertyCard[]` + meta

### GET `/properties/admin/all`

**Role:** ADMIN

All listings for moderation.

**Query:** `same filters + approvalStatus`

**Response:** 200 `PropertyCard[]` + meta

### GET `/properties/:idOrSlug`

**Role:** Public (optional auth)

Listing details with gallery, agent and `isFavorited`. Pending/rejected listings are visible only to their agent and admins. Increments views.

**Response:** 200 `Property`

### GET `/properties/:id/related`

**Role:** Public

Up to 4 similar listings (same type, same city first).

**Response:** 200 `PropertyCard[]`

### POST `/properties`

**Role:** AGENT, ADMIN

Create a listing. multipart/form-data: `images` (1–10 files, JPG/PNG/WEBP/AVIF, 5 MB each) + `data` (JSON). Agent listings start as PENDING approval.

**multipart/form-data**: files: `images`; `data` field:

```json
{
  "title": "Lake-view 3 bed apartment in Gulshan 2",
  "description": "South-facing 3 bedroom apartment on the 7th floor overlooking Gulshan Lake, with two balconies, a fitted kitchen and full generator backup.",
  "type": "APARTMENT",
  "purpose": "SALE",
  "price": 52000000,
  "bookingFee": 200000,
  "areaSqft": 2600,
  "bedrooms": 3,
  "bathrooms": 4,
  "division": "Dhaka",
  "city": "Dhaka",
  "area": "Gulshan",
  "address": "Road 53, Gulshan 2, Dhaka 1212",
  "latitude": 23.7956,
  "longitude": 90.4141,
  "amenities": [
    "Lift",
    "Generator Backup",
    "Lake View"
  ],
  "furnishing": "SEMI_FURNISHED",
  "yearBuilt": 2021,
  "floor": 7,
  "parkingSpaces": 2
}
```

**Response:** 201 `Property`

### PATCH `/properties/:id`

**Role:** Owner AGENT, ADMIN

Update a listing. multipart: new `images` + `data` (any create field, plus `removeImageIds[]`, `coverImageId`). Content edits by an agent send the listing back to review.

**multipart/form-data**: files: `images`; `data` field:

```json
{
  "price": 50000000,
  "removeImageIds": [],
  "coverImageId": "<image-uuid>"
}
```

**Response:** 200 `Property`

### PATCH `/properties/:id/status`

**Role:** Owner AGENT, ADMIN

Market status. SOLD only for SALE, RENTED only for RENT.

**Body**

```json
{
  "status": "SOLD"
}
```

**Response:** 200 `PropertyCard`

### PATCH `/properties/:id/approval`

**Role:** ADMIN

Approve or reject (a reason is required to reject). Notifies the agent by in-app notification and email.

**Body**

```json
{
  "approvalStatus": "REJECTED",
  "rejectionReason": "Please add photos of the actual unit and the building approval."
}
```

**Response:** 200 `PropertyCard`

### PATCH `/properties/:id/featured`

**Role:** ADMIN

Feature an approved listing on the home page.

**Body**

```json
{
  "isFeatured": true
}
```

**Response:** 200 `PropertyCard`

### DELETE `/properties/:id`

**Role:** Owner AGENT, ADMIN

Soft delete. Agents cannot delete a listing with a confirmed booking.

**Response:** 200 `{ id, title, isDeleted }`

## Favorites

### GET `/favorites`

**Role:** USER

Saved listings.

**Query:** `page, limit`

**Response:** 200 `{ id, createdAt, property }[]` + meta

### GET `/favorites/ids`

**Role:** USER

IDs of saved properties (for heart icons).

**Response:** 200 `string[]`

### POST `/favorites`

**Role:** USER

Save a listing (idempotent).

**Body**

```json
{
  "propertyId": "<property-uuid>"
}
```

**Response:** 201 `Favorite`

### DELETE `/favorites/:propertyId`

**Role:** USER

Remove from favorites.

**Response:** 200 `{ propertyId }`

## Inquiries

### POST `/inquiries`

**Role:** USER

Message the listing agent (one open inquiry per property). Agent gets an in-app notification and email.

**Body**

```json
{
  "propertyId": "<property-uuid>",
  "subject": "Is the price negotiable?",
  "message": "We can pay in full within 60 days. Is there any room on the price?",
  "phone": "01912345678"
}
```

**Response:** 201 `Inquiry`

### GET `/inquiries/my`

**Role:** USER

My inquiries.

**Query:** `searchTerm, status, propertyId, page, limit, sortBy, sortOrder`

**Response:** 200 `Inquiry[]` + meta

### GET `/inquiries/agent`

**Role:** AGENT

Inquiries for my listings.

**Query:** `searchTerm, status, propertyId, page, limit, sortBy, sortOrder`

**Response:** 200 `Inquiry[]` + meta

### GET `/inquiries`

**Role:** ADMIN

All inquiries.

**Query:** `searchTerm, status, propertyId, page, limit, sortBy, sortOrder`

**Response:** 200 `Inquiry[]` + meta

### GET `/inquiries/:id`

**Role:** Participant, ADMIN

Inquiry with the full reply thread.

**Response:** 200 `Inquiry`

### POST `/inquiries/:id/replies`

**Role:** Buyer or agent

Reply. The first agent reply moves NEW to IN_PROGRESS, and a buyer reply reopens RESOLVED.

**Body**

```json
{
  "message": "Yes, the owner can offer a 2% discount for a quick cash deal."
}
```

**Response:** 201 `InquiryReply`

### PATCH `/inquiries/:id/status`

**Role:** Listing AGENT, ADMIN

Change status.

**Body**

```json
{
  "status": "RESOLVED"
}
```

**Response:** 200 `Inquiry`

## Viewings

### POST `/viewings`

**Role:** USER

Request a viewing (at least 1 hour ahead, within 60 days, one active request per property). Agent is notified.

**Body**

```json
{
  "propertyId": "<property-uuid>",
  "scheduledAt": "2026-12-05T11:00:00.000Z",
  "message": "Evening works better for us."
}
```

**Response:** 201 `Viewing`

### GET `/viewings/my`

**Role:** USER

My viewings.

**Query:** `status, upcoming=true, searchTerm, page, limit, sortBy, sortOrder`

**Response:** 200 `Viewing[]` + meta

### GET `/viewings/agent`

**Role:** AGENT

Viewing requests for my listings.

**Query:** `status, upcoming=true, searchTerm, page, limit, sortBy, sortOrder`

**Response:** 200 `Viewing[]` + meta

### GET `/viewings`

**Role:** ADMIN

All viewings.

**Query:** `status, upcoming, searchTerm, page, limit, sortBy, sortOrder`

**Response:** 200 `Viewing[]` + meta

### PATCH `/viewings/:id/status`

**Role:** Listing AGENT, ADMIN

APPROVED / REJECTED (from PENDING or RESCHEDULED) or COMPLETED (after the time has passed). The user gets an in-app notification and email.

**Body**

```json
{
  "status": "APPROVED",
  "agentNote": "Please call me from the gate."
}
```

**Response:** 200 `Viewing`

### PATCH `/viewings/:id/reschedule`

**Role:** Listing AGENT, ADMIN

Propose a new time (status becomes RESCHEDULED). The user is notified.

**Body**

```json
{
  "scheduledAt": "2026-12-07T09:00:00.000Z",
  "agentNote": "The owner is only available on Saturday."
}
```

**Response:** 200 `Viewing`

### PATCH `/viewings/:id/cancel`

**Role:** Buyer or agent

Cancel an active viewing. The other side is notified.

**Body**

```json
{
  "reason": "We found another place."
}
```

**Response:** 200 `Viewing`

## Reviews

### GET `/reviews`

**Role:** Public

Visible reviews for one property OR one agent. meta has averageRating and totalReviews.

**Query:** `propertyId | agentId, page, limit, sortBy (createdAt|rating), sortOrder`

**Response:** 200 `Review[]` + meta

### GET `/reviews/testimonials`

**Role:** Public

Top 6 agent reviews (4★+) for the home page.

**Response:** 200 `Review[]`

### GET `/reviews/my`

**Role:** USER

My reviews.

**Query:** `page, limit, sortBy, sortOrder`

**Response:** 200 `Review[]` + meta

### GET `/reviews/all`

**Role:** ADMIN

All reviews for moderation.

**Query:** `target, rating, isHidden, searchTerm, page, limit, sortBy, sortOrder`

**Response:** 200 `Review[]` + meta

### POST `/reviews`

**Role:** USER

Review a property or an agent. Requires a prior inquiry, viewing or booking. One review per target. Ratings are recalculated in the same transaction.

**Body**

```json
{
  "target": "AGENT",
  "agentId": "<agent-user-uuid>",
  "rating": 5,
  "comment": "Answered every question within an hour and arranged a Saturday viewing."
}
```

**Response:** 201 `Review`

### PATCH `/reviews/:id`

**Role:** Author

Edit own review.

**Body**

```json
{
  "rating": 4,
  "comment": "Updated after moving in: the generator handles every outage."
}
```

**Response:** 200 `Review`

### PATCH `/reviews/:id/visibility`

**Role:** ADMIN

Hide or show (hidden reviews do not count in ratings).

**Body**

```json
{
  "isHidden": true
}
```

**Response:** 200 `Review`

### DELETE `/reviews/:id`

**Role:** Author, ADMIN

Delete a review.

**Response:** 200 `Review`

## Bookings

### POST `/bookings`

**Role:** USER

Book an AVAILABLE property (amount = the listing's bookingFee). Status PENDING_PAYMENT; unpaid bookings auto-cancel after 1 hour.

**Body**

```json
{
  "propertyId": "<property-uuid>",
  "note": "We would like to move in on 1 January."
}
```

**Response:** 201 `Booking`

### GET `/bookings/my`

**Role:** USER

My bookings with payments.

**Query:** `status, searchTerm, page, limit, sortBy, sortOrder`

**Response:** 200 `Booking[]` + meta

### GET `/bookings/agent`

**Role:** AGENT

Bookings on my listings.

**Query:** `status, searchTerm, page, limit, sortBy, sortOrder`

**Response:** 200 `Booking[]` + meta

### GET `/bookings`

**Role:** ADMIN

All bookings.

**Query:** `status, searchTerm, page, limit, sortBy, sortOrder`

**Response:** 200 `Booking[]` + meta

### GET `/bookings/:id`

**Role:** Buyer, agent, ADMIN

Booking details.

**Response:** 200 `Booking`

### PATCH `/bookings/:id/cancel`

**Role:** USER (unpaid only), ADMIN

Cancel. When an admin cancels a confirmed booking, the property becomes AVAILABLE again.

**Body**

```json
{
  "reason": "Plans changed."
}
```

**Response:** 200 `Booking`

## Payments (bKash)

### POST `/payments/bkash/create`

**Role:** USER

Start bKash checkout for a PENDING_PAYMENT booking. Redirect the browser to `paymentURL`.

**Body**

```json
{
  "bookingId": "<booking-uuid>"
}
```

**Response:** 201 `{ paymentId, transactionId, amount, paymentURL }`

### GET `/payments/bkash/callback`

**Role:** bKash redirect

Executes the payment. On success one DB transaction marks the payment SUCCESS, confirms the booking, sets the property to PENDING and cancels other unpaid bookings for it. The user and agent are notified and the user is emailed. Redirects to `FRONTEND_URL/payment/success|failed|cancelled?transactionId=`.

**Query:** `paymentID, status (success|failure|cancel)`

**Response:** 302 redirect

### GET `/payments/my-payments`

**Role:** USER

My payment history (meta.totalPaid).

**Query:** `status, searchTerm, sortBy (createdAt|amount|paidAt), sortOrder, page, limit`

**Response:** 200 `Payment[]` + meta

### GET `/payments/agent-payments`

**Role:** AGENT

Payments for my listings (meta.totalPaid).

**Query:** `same as above`

**Response:** 200 `Payment[]` + meta

### GET `/payments/all-payments`

**Role:** ADMIN

All transactions (meta.totalPaid).

**Query:** `same as above`

**Response:** 200 `Payment[]` + meta

### GET `/payments/:paymentId`

**Role:** Payer, agent, ADMIN

Payment details.

**Response:** 200 `Payment`

## Notifications

### GET `/notifications`

**Role:** Any logged-in

My notifications (meta.unreadCount).

**Query:** `isRead, page, limit`

**Response:** 200 `Notification[]` + meta

### PATCH `/notifications/read-all`

**Role:** Any logged-in

Mark all as read.

**Response:** 200 `{ updated }`

### PATCH `/notifications/:id/read`

**Role:** Any logged-in

Mark one as read.

**Response:** 200 `Notification`

### DELETE `/notifications/:id`

**Role:** Any logged-in

Delete one.

**Response:** 200 `Notification`

## Contact

### POST `/contacts`

**Role:** Public

Contact form (stored in the database, rate-limited).

**Body**

```json
{
  "name": "Rumana Akter",
  "email": "rumana@example.com",
  "phone": "01811223344",
  "subject": "Listing my flat in Mirpur DOHS",
  "message": "Could one of your agents call me to discuss the valuation of my flat?"
}
```

**Response:** 201 `{ id, name, subject, createdAt }`

### GET `/contacts`

**Role:** ADMIN

Messages (meta.unreadCount).

**Query:** `status, searchTerm, page, limit, sortBy, sortOrder`

**Response:** 200 `ContactMessage[]` + meta

### PATCH `/contacts/:id/status`

**Role:** ADMIN

NEW / READ / RESOLVED.

**Body**

```json
{
  "status": "RESOLVED"
}
```

**Response:** 200 `ContactMessage`

### DELETE `/contacts/:id`

**Role:** ADMIN

Delete a message.

**Response:** 200 `ContactMessage`

## Newsletter

### POST `/newsletter/subscribe`

**Role:** Public

Subscribe (201 new, 200 already subscribed). Rate-limited.

**Body**

```json
{
  "email": "investor@example.com"
}
```

**Response:** 201/200 `{ email }`

### GET `/newsletter`

**Role:** ADMIN

Subscribers.

**Query:** `searchTerm, page, limit, sortOrder`

**Response:** 200 `Subscriber[]` + meta

### DELETE `/newsletter/:id`

**Role:** ADMIN

Remove a subscriber.

**Response:** 200 `Subscriber`

## Blog

### GET `/blogs`

**Role:** Public

Published articles (without content).

**Query:** `searchTerm, category, page, limit, sortBy, sortOrder`

**Response:** 200 `BlogPost[]` + meta

### GET `/blogs/categories`

**Role:** Public

Categories with article counts.

**Response:** 200 `{ category, count }[]`

### GET `/blogs/admin/all`

**Role:** ADMIN

All posts including drafts.

**Query:** `searchTerm, category, isPublished, page, limit, sortBy, sortOrder`

**Response:** 200 `BlogPost[]` + meta

### GET `/blogs/admin/:id`

**Role:** ADMIN

Any post (drafts included) with full content, for the edit form.

**Response:** 200 `BlogPost`

### GET `/blogs/:slug`

**Role:** Public

A published article with up to 3 related posts.

**Response:** 200 `BlogPost`

### POST `/blogs`

**Role:** ADMIN

Create. multipart: `coverImage` (file) + `data` (JSON). Category is one of: Buying Guide, Renting Tips, Market Insights, Legal & Documentation, Home Finance, Neighbourhood Guide.

**multipart/form-data**: files: `coverImage`; `data` field:

```json
{
  "title": "Checklist before you buy a flat in Dhaka",
  "excerpt": "Ten documents to verify before paying any advance for an apartment in Dhaka.",
  "content": "<at least 300 characters>",
  "category": "Buying Guide",
  "isPublished": true
}
```

**Response:** 201 `BlogPost`

### PATCH `/blogs/:id`

**Role:** ADMIN

Update (multipart, same fields optional).

**multipart/form-data**: files: `coverImage`; `data` field:

```json
{
  "isPublished": true
}
```

**Response:** 200 `BlogPost`

### DELETE `/blogs/:id`

**Role:** ADMIN

Delete a post.

**Response:** 200 `BlogPost`

## Dashboard

### GET `/dashboard/public-stats`

**Role:** Public

Home page statistics: available listings, verified agents, cities, closed deals, happy clients, counts per type, top cities.

**Response:** 200 `{ totals, propertyTypes, topCities }`

### GET `/dashboard/admin`

**Role:** ADMIN

Totals; charts: monthlyRevenue (line), monthlyGrowth listings+signups (bar), propertiesByType (pie), propertiesByApproval, bookingsByStatus; recent pending listings and payments.

**Response:** 200 `{ totals, charts, recent }`

### GET `/dashboard/agent`

**Role:** AGENT

Totals; charts: listingsByStatus (pie), monthlyActivity inquiries+viewings (bar), monthlyEarnings (line), topViewedListings; recent inquiries.

**Response:** 200 `{ totals, charts, recent }`

### GET `/dashboard/user`

**Role:** USER

Totals; charts: monthlySpending (line), viewingsByStatus and inquiriesByStatus (pie); upcoming viewings and recent bookings.

**Response:** 200 `{ totals, charts, recent }`
