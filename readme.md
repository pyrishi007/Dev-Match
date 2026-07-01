# Dev-Match

A Node.js / Express / MongoDB backend for a developer profile & matching platform. Handles account registration, JWT-based authentication (cookie sessions), password recovery via email, and profile management. A connection/matching module (`request.js`) is scaffolded but not yet implemented.

> **Status:** Active development. Auth and profile flows work end-to-end; the matching/request feature is a stub. See [Known Issues](#known-issues--roadmap) before deploying.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Data Model](#data-model)
6. [API Reference](#api-reference)
7. [Authentication Flow](#authentication-flow)
8. [Validation Rules](#validation-rules)
9. [Error Handling](#error-handling)
10. [Known Issues & Roadmap](#known-issues--roadmap)

---

## Tech Stack

| Layer          | Technology                                  |
|----------------|----------------------------------------------|
| Runtime        | Node.js                                       |
| Framework      | Express 5                                     |
| ODM / Database | Mongoose + MongoDB                            |
| Auth           | `jsonwebtoken` (cookie-based JWT) + `bcrypt`  |
| Email          | `nodemailer` (Gmail transport) for password resets |
| Validation     | Mongoose schema validators + `validator` npm package + custom app-level checks |
| Config         | `dotenv`                                      |
| Dev tooling    | `nodemon`                                     |

---

## Architecture

```
Dev-Match/
├── src/
│   ├── server.js                    # Express app bootstrap, route mounting, DB connect
│   ├── config/
│   │   └── database.js              # Mongoose connection
│   ├── middleware/
│   │   ├── errorHandler.js          # Centralized error-to-HTTP-status mapping
│   │   └── userAuth.js              # JWT verification middleware (reads cookie, attaches req.user)
│   ├── models/
│   │   └── user.model.js            # Client schema + instance methods (JWT sign, password check, etc.)
│   ├── routes/
│   │   ├── auth.js                  # register / login / logout / forgot-password / reset-password
│   │   ├── profile.js               # view / edit own profile (protected)
│   │   ├── user.js                  # feed of users (protected)
│   │   └── request.js               # connection/match requests — not yet implemented
│   └── Utils/
│       ├── CONSTANTS.js             # Regex + allow-lists
│       ├── password.js              # bcrypt hashing helper
│       ├── resetPasswordMail.js     # nodemailer transport + reset-token email template
│       └── validations.js           # Registration / login / edit / password-reset validation logic
├── .env                              # not committed
├── package.json
└── readme.md
```

**Request lifecycle:**

```
Client Request
     │
     ▼
Express Router (server.js)
     │
     ├── /auth/*     → auth.js        (public)
     ├── /user/*     → user.js        (userAuth middleware required)
     └── /profile/*  → profile.js     (userAuth middleware required)
     │
     ▼
Application validation (Utils/validations.js)
     │
     ▼
Password hashing / comparison (Utils/password.js, bcrypt) ── register & login only
     │
     ▼
Mongoose model operation (models/user.model.js)
     │
     ▼
Schema-level validation (Mongoose)
     │
     ▼
Response sent ──(on error)──▶ next(err) ──▶ errorHandler middleware
```

---

## Getting Started

### Prerequisites

- Node.js >= 18.x (Express 5 requires a modern Node version)
- A MongoDB instance (local or Atlas)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) if you want the forgot-password email flow to work

### Install & Run

```bash
git clone https://github.com/pyrishi007/Dev-Match.git
cd Dev-Match
npm install
```

Create a `.env` file in the project root (see [Environment Variables](#environment-variables) below), then:

```bash
npm start
```

On success:

```
DB connection successfull
Server is up and running on 4000
```

---

## Environment Variables

| Variable         | Required | Description                                                        |
|-------------------|:--------:|----------------------------------------------------------------------|
| `mongoStr`        | ✅        | MongoDB connection URI                                              |
| `JWT_SECRET_KEY`  | ✅        | Secret used to sign/verify login JWTs                               |
| `USER_EMAIL`      | ✅*       | Gmail address used as the sender for password-reset emails          |
| `USER_PASS`       | ✅*       | Gmail App Password for the above account                            |

\* Only required if you're using `POST /auth/forget-password`.

```env
mongoStr=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET_KEY=<a long random string>
USER_EMAIL=youraddress@gmail.com
USER_PASS=<gmail app password>
```

> ⚠️ `JWT_SECRET_KEY` should be a long, random, unguessable string — treat it like a password. Never commit `.env`.

---

## Data Model

### Collection: `clients` (model name `Client`)

| Field           | Type     | Required | Unique | Notes                                                                 |
|------------------|----------|:--------:|:------:|------------------------------------------------------------------------|
| `firstname`      | String   | ✅        | —      | Min 4 chars, enforced app-level                                       |
| `lastname`       | String   | —        | —      | Min 4 chars if provided, enforced app-level                           |
| `dob`            | Date     | —        | —      | No constraint                                                          |
| `number`         | String   | ✅        | ✅      | Must match `/^\d{10}$/`                                                |
| `email`          | String   | ✅        | —      | Lowercased/trimmed; format validated via `validator.isEmail()`. **Not unique at the schema level** — see [Known Issues](#known-issues--roadmap) |
| `password`       | String   | ✅        | —      | Stored as a bcrypt hash                                                |
| `age`            | Number   | ✅        | —      | Minimum `18`                                                           |
| `gender`         | String   | ✅        | —      | One of `male` / `female` / `other` (case-insensitive)                 |
| `profileURL`     | String   | —        | —      | Defaults to `"URL"`                                                    |
| `skills`         | [String] | —        | —      | —                                                                       |
| `passwordToken`  | String   | —        | —      | Temporary token used for the forgot/reset-password flow                |
| `createdAt`      | Date     | auto     | —      | via `timestamps: true`                                                 |
| `updatedAt`      | Date     | auto     | —      | via `timestamps: true`                                                 |

### Schema instance methods

| Method             | Purpose                                                      |
|----------------------|----------------------------------------------------------------|
| `genrateJWT()`       | Signs a JWT (`{ _id }`) with `JWT_SECRET_KEY`, expires in 1 day |
| `checkPassword(pw)`  | bcrypt-compares a plaintext password against the stored hash   |
| `editData(data)`     | Applies an update object to the document and saves it          |
| `saveToken(token)`   | Persists a `passwordToken` (used for reset flow)                |
| `verifyToken(token)` | Checks a submitted token against the stored `passwordToken`    |

---

## API Reference

### Auth — `src/routes/auth.js` (public)

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/auth/register` | Create a new user. Validates input, hashes password, saves document. |
| `POST` | `/auth/login` | Validates credentials, issues a JWT in an httpOnly-style cookie (`token`). |
| `POST` | `/auth/logout` | Expires the `token` cookie immediately. |
| `POST` | `/auth/forget-password` | Generates a random token, saves it on the user, emails it via nodemailer. |
| `PATCH`| `/auth/reset-password` | Verifies the emailed token and updates the password. |

**Register — request body:**

```json
{
  "firstname": "Rohit",
  "lastname": "Sharma",
  "dob": "1999-05-15",
  "number": "9876543210",
  "email": "rohit@example.com",
  "password": "Secure@123",
  "age": 25,
  "gender": "male",
  "profileURL": "https://example.com/avatar.jpg",
  "skills": ["JavaScript", "Node.js"]
}
```

**Login — request body:**

```json
{ "email": "rohit@example.com", "password": "Secure@123" }
```

Response: `200 OK`, body `"Login successfull"`, plus a `token` cookie containing the signed JWT.

**Forgot password — request body:**

```json
{ "email": "rohit@example.com" }
```

Sends a 6-character hex token to the user's email, valid for 15 minutes (per the email template — not currently enforced server-side, see [Known Issues](#known-issues--roadmap)).

**Reset password — request body:**

```json
{ "token": "a1b2c3", "newPassword": "NewSecure@123" }
```

---

### Profile — `src/routes/profile.js` (protected — requires valid `token` cookie)

| Method  | Route | Description |
|---------|-------|-------------|
| `GET`   | `/profile/view` | Returns the authenticated user's own document. |
| `PATCH` | `/profile/edit` | Updates the authenticated user's own profile. Only fields in `ALLOWED_UPDATE` are accepted. |

**Editable fields:** `firstname`, `lastname`, `age`, `profileURL`, `skills`

---

### User — `src/routes/user.js` (protected — requires valid `token` cookie)

| Method | Route | Description |
|--------|-------|-------------|
| `GET`  | `/user/feed` | Returns all user documents. **No pagination; not scoped to exclude the requester or already-connected users** — see [Known Issues](#known-issues--roadmap). |

---

### Connections / Requests — `src/routes/request.js`

Not implemented yet. The router file is empty and not mounted in `server.js`. This is presumably where match/connection-request endpoints (send, accept, reject) will live.

---

## Authentication Flow

1. **Login (`POST /auth/login`)** — credentials are validated, `bcrypt.compare()` checks the password, and on success a JWT signed with `JWT_SECRET_KEY` (1-day expiry) is set as a `token` cookie.
2. **Protected routes (`/user/*`, `/profile/*`)** — `middleware/userAuth.js` reads the `token` cookie, verifies it, loads the corresponding `Client` from the database, and attaches it to `req.user`. Missing, invalid, or expired tokens are passed to the error handler (`JsonWebTokenError` / `TokenExpiredError` → `500`, see [Error Handling](#error-handling)).
3. **Logout (`POST /auth/logout`)** — the `token` cookie is immediately expired.

```
Client                              Server
  │                                   │
  │── POST /auth/login ──────────────▶│  validate → bcrypt.compare → sign JWT
  │◀── 200 + Set-Cookie: token ───────│
  │                                   │
  │── GET /profile/view (cookie) ────▶│  userAuth: verify JWT → load user → req.user
  │◀── 200 + user document ───────────│
```

---

## Validation Rules

### Application-level (`Utils/validations.js`)

| Function | Used by | Checks |
|----------|---------|--------|
| `validateRegistrationData` | `POST /auth/register` | firstname/lastname presence, firstname length ≥ 4, password strength (`validator.isStrongPassword`), duplicate email lookup |
| `authenticateUser` | `POST /auth/login` | email format, user exists, password matches |
| `validateEditData` | `PATCH /profile/edit` | only allow-listed fields present |
| `forgetDataValidation` | `POST /auth/forget-password` | email format, user exists |
| `resetDataValidation` | `PATCH /auth/reset-password` | new-password strength, token maps to a user |

### Schema-level (Mongoose, `user.model.js`)

| Field | Validator |
|-------|-----------|
| `number` | `/^\d{10}$/` |
| `email` | `validator.isEmail()` |
| `age` | Minimum `18` |
| `gender` | Must be `male` / `female` / `other` |

---

## Error Handling

All errors are passed to `next(err)` and handled centrally in `middleware/errorHandler.js`:

| Error | HTTP Status |
|-------|:-----------:|
| `ValidationError` (Mongoose) | `400` |
| `CastError` (bad ObjectId) | `400` |
| Duplicate key (`code: 11000`) | `409` |
| `TypeError` / `ReferenceError` | `500` |
| `JsonWebTokenError` | `500` |
| `TokenExpiredError` | `500` |
| Anything else | `500` |

> Note: auth/token failures currently return `500` rather than the more conventional `401`. Worth revisiting — see below.

---

## Known Issues & Roadmap

These are real gaps in the current code, not hypothetical — worth fixing before this goes anywhere near production:

- 🔴 **`GET /user/feed` will crash at runtime.** `src/routes/user.js` calls `Client.find()` but never imports the `Client` model, so this route throws a `ReferenceError` on every request.
- 🔴 **`email` isn't unique at the database/schema level.** Uniqueness is only checked in `validateRegistrationData` before saving — a race condition (two near-simultaneous registrations) can still create duplicate emails. Add `unique: true` to the schema field.
- 🟠 **Auth failures return `500` instead of `401`.** `userAuth.js` throws plain `Error`s for missing/invalid tokens, which the global handler falls through to the generic `500` branch. Consider a dedicated `AuthenticationError` mapped to `401`.
- 🟠 **Password-reset token has no server-side expiry.** The email says the token is valid for 15 minutes, but nothing in `resetDataValidation` or the schema actually enforces that — the token stays valid until it's used or overwritten.
- 🟠 **`GET /user/feed` has no pagination** and returns the entire collection, including the requester themselves.
- 🟡 **`request.js` (connection/match requests) is an empty stub**, not mounted in `server.js`. Core "matching" functionality doesn't exist yet.
- 🟡 **No rate limiting** on `/auth/login` or `/auth/forget-password` — both are good candidates for `express-rate-limit`.
- 🟡 **No input sanitization** against NoSQL injection (`express-mongo-sanitize` isn't in use).
- 🟢 **`EMAILREGEX` and `PASSWORD_REGEX` in `CONSTANTS.js` are defined but unused** (the `validator` package is used instead) — remove or consolidate.
- 🟢 Cookie set on login (`res.cookie("token", token)`) has no `httpOnly`, `secure`, or `sameSite` flags set — should be hardened before any production deploy.

---

## License

ISC (per `package.json`).