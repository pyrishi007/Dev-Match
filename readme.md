# User Management API — Production Documentation

**Version:** 1.2.0
**Base URL:** `http://<host>:4000`
**Protocol:** HTTP/HTTPS
**Data Format:** JSON

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Code Comment Conventions](#code-comment-conventions)
4. [Environment Setup](#environment-setup)
5. [Data Model](#data-model)
6. [Validation Rules](#validation-rules)
7. [API Endpoints](#api-endpoints)
8. [Error Handling](#error-handling)
9. [Constants & Configuration](#constants--configuration)
10. [Security Considerations](#security-considerations)
11. [Known Limitations & Improvements](#known-limitations--improvements)

---

## Overview

A RESTful backend API built with **Node.js**, **Express.js**, and **MongoDB (via Mongoose)**. Provides full CRUD operations for managing user (`Client`) records, with authentication (register/login), schema-level and application-level validation, and bcrypt password security.

**Tech Stack:**

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| ODM | Mongoose |
| Database | MongoDB |
| Validation | Mongoose schema validators + custom middleware + `validator` npm package |
| Auth | `bcrypt` (password hashing + comparison) |
| Config | `dotenv` |

---

## Architecture

```
project-root/
├── src/
│   ├── server.js               # Entry point — Express app, routes, server bootstrap
│   ├── config/
│   │   └── database.js         # MongoDB connection logic
│   ├── middleware/
│   │   └── errorHandler.js     # Global error handling middleware
│   ├── models/
│   │   └── user.model.js       # Mongoose schema and model (Client)
│   └── Utils/
│       ├── CONSTANTS.js        # Regex patterns and allowed value lists
│       ├── password.js         # Password hashing utility (bcrypt)
│       └── validations.js      # Application-level validation functions
├── .env
├── .gitignore
├── package.json
└── package-lock.json
```

**Request Lifecycle:**

```
Client Request
     │
     ▼
Express Router (server.js)
     │
     ▼
Application Validation (Utils/validations.js)     ← runs before DB ops
     │
     ├── [Auth Routes]  validateRegistrationData / authenticateUser
     │
     ├── [User Routes]  validateUpdateData
     │
     ▼
Password Hashing / Comparison (Utils/password.js) ← register & login only
     │
     ▼
Mongoose Model / DB Operation (models/user.model.js)
     │
     ▼
Schema-level Validation (Mongoose)
     │
     ▼
Response sent  ──(on error)──▶  next(err)  ──▶  errorHandler middleware
```

---

## Code Comment Conventions

The codebase uses a consistent inline comment system to mark the purpose of every block. This makes navigation fast and the intent of each section immediately clear.

| Comment Tag | Meaning | Example Location |
|---|---|---|
| `---LIBRARY IMPORTS---` | Third-party `require()` statements | Top of every file |
| `---UTILITY---` / `--UTILITY---` | Internal module imports (models, constants) | `validations.js`, `user.model.js` |
| `---HELPER FUNCTION IMPORTS---` | Named function imports from Utils | `server.js` |
| `DB CONNECTION CONFIG` | MongoDB connection setup | `database.js` |
| `DB SCHEMA DESIGN` | Mongoose schema definition block | `user.model.js` |
| `SCHEMA LEVEL VALDATION CHECKS` | Inline `validate()` blocks on schema fields | `user.model.js` |
| `SCHEMA LEVEL - <FIELD> VALIDATION` | Per-field validation comment | `number`, `email`, `gender` fields |
| `----GLOBAL ERROR HANDLER----` | Error handler middleware entry | `errorHandler.js` |
| `VALIDATION ERROR` / `TYPE ERROR` etc. | Named error case blocks inside error handler | `errorHandler.js` |
| `PASSWORD HASHING & ENCRYPTION` | bcrypt utility function | `password.js` |
| `RESITER VALIDATION` | Registration validation function block | `validations.js` |
| `UPDATE VALIDATION` | Update field whitelist check | `validations.js` |
| `LOGIN VALIDATION` | Login authentication function block | `validations.js` |
| `--SETING DNS LOCALLY--` | DNS override for local dev reliability | `server.js` |
| `--BASIC CONFIG SETUP--` | Express app init and PORT declaration | `server.js` |
| `------- AUTH ROUTES ------` | Authentication route group separator | `server.js` |
| `------ PROTECTED ROUTES -------` | User data route group separator | `server.js` |
| `---- DB CONNECTION ----` | Database connect + server listen block | `server.js` |
| `DEAFULT URL FOR PROFILE` | Default value note on `profileURL` field | `user.model.js` |
| `MINIMUM AGE DATA = >18` | Min age constraint note | `user.model.js` |

> This commenting style is intentional — each file is self-documenting at a glance, and every logical section is labeled before it begins. It's a good habit to maintain this pattern as the codebase grows.

---

## Environment Setup

### Prerequisites

- Node.js >= 16.x
- MongoDB instance (local or Atlas)

### Environment Variables

Create a `.env` file in the project root:

```env
mongoStr=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

| Variable | Required | Description |
|---|---|---|
| `mongoStr` | ✅ | MongoDB connection URI |

### Starting the Server

```bash
npm install
node src/server.js
```

On successful startup:

```
DB connection successfull
Server is up and running on 4000
```

---

## Data Model

### Collection: `clients`

Defined in `src/models/user.model.js` via `clientSchema`.

| Field | Type | Required | Unique | Constraints |
|---|---|---|---|---|
| `firstname` | String | ✅ | — | Min 4 characters (app-level) |
| `lastname` | String | — | — | Min 4 characters if provided (app-level) |
| `dob` | Date | — | — | Date of birth; no schema-level constraint |
| `number` | String | ✅ | ✅ | Must match `/^\d{10}$/` — exactly 10 digits |
| `email` | String | ✅ | — | Lowercase, trimmed; validated via `validator.isEmail()`; unique enforced app-level |
| `password` | String | ✅ | — | Must pass `validator.isStrongPassword()` (app-level); stored as bcrypt hash |
| `age` | Number | ✅ | — | Minimum value: `18` |
| `gender` | String | ✅ | — | Must be one of: `"male"`, `"female"`, `"other"` (case-insensitive) |
| `profileURL` | String | — | — | Defaults to `"URL"` if not provided |
| `skills` | [String] | — | — | Array of strings |
| `createdAt` | Date | auto | — | Added by `timestamps: true` |
| `updatedAt` | Date | auto | — | Added by `timestamps: true` |

### Example Document

```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "firstname": "Rohit",
  "lastname": "Sharma",
  "dob": "1999-05-15",
  "number": "9876543210",
  "email": "rohit@example.com",
  "password": "$2b$10$hashedpassword",
  "age": 25,
  "gender": "male",
  "profileURL": "https://example.com/avatar.jpg",
  "skills": ["JavaScript", "Node.js", "MongoDB"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## Validation Rules

Validation runs at two levels:

### 1. Application-Level (`Utils/validations.js`)

Executed before any database operation. Errors thrown here propagate to the global error handler.

#### On `POST /auth/register` — `validateRegistrationData(req)`

| Rule | Condition | Error Message |
|---|---|---|
| Name required | Neither `firstname` nor `lastname` provided | `"Please provide either a firstname or lastname."` |
| Min length — firstname | `firstname` present but < 4 chars | `"Please provide minimum 4 charaters in firstname"` |
| Strong password | Password doesn't meet `isStrongPassword()` criteria | `"Password does not meet the security requirements."` |
| Unique email | Email already exists in DB | `"Email is already in use"` |

> `validator.isStrongPassword()` defaults: min 8 chars, at least 1 lowercase, 1 uppercase, 1 number, 1 symbol.

#### On `POST /auth/login` — `authenticateUser(password, email)`

| Rule | Condition | Error Message |
|---|---|---|
| Valid email format | `email` is missing or fails `validator.isEmail()` | `"Incorrect email or password"` |
| User exists | No user found matching the email | `"Incorrect email or password"` |
| Password match | `bcrypt.compare()` returns false | `"Invalid password"` |

#### On `PATCH /user/:id` — `validateUpdateData(req)`

Only fields in `ALLOWED_UPDATE` may be patched.

| Allowed Fields |
|---|
| `firstname` |
| `age` |
| `profileURL` |
| `skills` |

Any other field in the request body throws: `"Update not allowed"`

### 2. Schema-Level (Mongoose)

Runs during `.save()` and `.findByIdAndUpdate()` (when `runValidators: true` is set).

| Field | Validator |
|---|---|
| `number` | `/^\d{10}$/` regex via custom `validate()` |
| `email` | `validator.isEmail()` via custom `validate()` |
| `age` | Minimum value: `18` |
| `gender` | Must be in `["male", "female", "other"]` (case-insensitive check) |

---

## API Endpoints

### Auth Routes

---

### `POST /auth/register`
**Register a new user**

**Request Body:**

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

**Processing order:**
1. `validateRegistrationData(req)` — name, password strength, duplicate email check
2. `encryptPassword(password)` — bcrypt hash (10 salt rounds)
3. `Client({...}).save()` — persists document with hashed password

**Success Response — `200 OK`:**

Returns the saved Mongoose document. The `password` field will contain the bcrypt hash, not the plaintext value.

**Error Responses:**

| Status | Cause |
|---|---|
| `400` | Mongoose `ValidationError` (schema-level failure) |
| `409` | Duplicate `number` field (unique constraint violation) |
| `500` | Application validation error or unhandled error |

---

### `POST /auth/login`
**Authenticate an existing user**

**Request Body:**

```json
{
  "email": "rohit@example.com",
  "password": "Secure@123"
}
```

**Processing order:**
1. `authenticateUser(password, email)` — validates email format, finds user, runs `bcrypt.compare()`
2. On success, responds with confirmation message

**Success Response — `200 OK`:**

```
Login successfull
```

**Error Responses:**

| Status | Cause |
|---|---|
| `500` | Invalid email format, user not found, or password mismatch |

---

### User Routes

---

### `GET /user`
**Retrieve all users**

**Request:** No parameters required.

**Success Response — `200 OK`:**

```json
[
  { "_id": "...", "firstname": "Rohit", ... },
  { "_id": "...", "firstname": "Priya", ... }
]
```

Returns an empty array `[]` if no users exist.

---

### `GET /user/id/:id`
**Retrieve a user by MongoDB ObjectId**

| Param | Type | Description |
|---|---|---|
| `id` | String | Valid MongoDB ObjectId |

**Success Response — `200 OK`:** The user document, or `null` if not found.

**Error Response:**

| Status | Cause |
|---|---|
| `400` | Invalid ObjectId format (`CastError`) |

---

### `GET /user/email/:email`
**Retrieve a user by email address**

| Param | Type | Description |
|---|---|---|
| `email` | String | Email address of the user |

**Success Response — `200 OK`:** The user document, or `null` if not found.

---

### `DELETE /user/:id`
**Delete a user by MongoDB ObjectId**

| Param | Type | Description |
|---|---|---|
| `id` | String | Valid MongoDB ObjectId |

**Success Response — `200 OK`:**

```
User successfully deleted : { _id: '...', firstname: 'Rohit', ... }
```

Returns `null` in the message if no user was found with that ID (no error thrown).

---

### `PATCH /user/:id`
**Partially update a user by MongoDB ObjectId**

| Param | Type | Description |
|---|---|---|
| `id` | String | Valid MongoDB ObjectId |

**Request Body** (only allowed fields):

```json
{
  "firstname": "UpdatedName",
  "age": 30,
  "profileURL": "https://example.com/new-avatar.jpg",
  "skills": ["TypeScript", "React"]
}
```

**Options used internally:**
- `returnDocument: "after"` — returns the updated document
- `runValidators: true` — re-runs schema validators on patched fields

**Success Response — `200 OK`:** Returns the updated Mongoose document.

**Error Responses:**

| Status | Cause |
|---|---|
| `400` | Schema validation failure on patched fields or invalid ObjectId |
| `500` | Disallowed field in body (`"Update not allowed"`) or unhandled error |

---

## Error Handling

All errors are caught via `next(err)` and routed to the global handler in `src/middleware/errorHandler.js`.

### Error Response Format

```
<ErrorType>: <ERROR_NAME>
Error Message: <err.message>
```

### Handled Error Types

| Error Name | HTTP Status | Trigger |
|---|---|---|
| `ValidationError` | `400` | Mongoose schema validation failed |
| `CastError` | `400` | Invalid MongoDB ObjectId format |
| `TypeError` | `500` | Null/undefined access, wrong type operations |
| `ReferenceError` | `500` | Access to undefined variables |
| Duplicate Key (`code: 11000`) | `409` | Unique field constraint violated (e.g. `number`) |
| Any other error | `500` | Generic fallback |

### Example Error Responses

**400 — Validation failure:**
```
Bad request: VALIDATIONERROR
Error Message: Client validation failed: age: Path `age` (16) is less than minimum allowed value (18).
```

**400 — Invalid ObjectId:**
```
Bad Request: Invalid _id
```

**409 — Duplicate data:**
```
Duplicate data already exists.
```

**500 — Update not allowed:**
```
Error: ERROR
Error Message: Update not allowed
```

---

## Constants & Configuration

Defined in `src/Utils/CONSTANTS.js`:

| Constant | Value | Used For |
|---|---|---|
| `NUMBEREGEX` | `/^\d{10}$/` | 10-digit phone number schema validation |
| `EMAILREGEX` | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | Defined but not currently used in routes |
| `PASSWORD_REGEX` | `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])...$/` | Defined but not currently used in routes |
| `ALLOWED_GENDER_VALUES` | `["male", "female", "other"]` | Gender field schema validation |
| `ALLOWED_UPDATE` | `["firstname", "age", "profileURL", "skills"]` | PATCH field whitelist |

**DNS Configuration:**

The app sets DNS servers at startup for improved resolution reliability:

```javascript
dns.setServers(["1.1.1.1", "8.8.8.8"]); // Cloudflare, Google
```

---

## Security Considerations

| Issue | Risk | Status |
|---|---|---|
| ~~Passwords stored in plaintext~~ | ~~🔴 Critical~~ | ✅ Fixed — bcrypt hashing via `Utils/password.js` |
| No authentication/authorization on user routes | 🔴 Critical | Add JWT middleware to protect `/user/*` routes |
| Login errors not uniform (two different messages) | 🟠 High | Standardize to one generic message to prevent user enumeration |
| `GET /user` returns all users with no limit | 🟠 High | Add pagination and restrict to admin roles |
| `email` not enforced unique at DB level | 🟠 High | Add `unique: true` to the email field in schema |
| No rate limiting | 🟠 High | Add `express-rate-limit` middleware |
| Error messages expose internal details | 🟡 Medium | Return generic messages to clients; log internals only |
| No HTTPS enforcement | 🟡 Medium | Use a reverse proxy (nginx) with TLS in production |
| `errorMonitor` imported but unused in `server.js` | 🟢 Low | Remove the unused import |
| `EMAILREGEX` and `PASSWORD_REGEX` defined but unused | 🟢 Low | Use in schema-level validation or remove |

---

## Known Limitations & Improvements

### Missing: JWT Auth on Protected Routes

`/user/*` routes are currently unprotected. Anyone can read, update, or delete records. Add JWT middleware:

```javascript
// middleware/auth.js
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Access denied");
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
};
```

### Missing: Login Success Response

`POST /auth/login` currently returns a plain string on success. A proper response should return a JWT token and user info:

```javascript
res.send({ message: "Login successful", token: jwt.sign({ id: user._id }, process.env.JWT_SECRET) });
```

### Missing: 404 Handling

When a user is not found by ID or email, the API returns `null` with `200 OK`. A proper 404 should be returned:

```javascript
if (!user) return res.status(404).send("User not found");
```

### Missing: Input Sanitization

Request bodies are passed directly to Mongoose without sanitization. Add `express-mongo-sanitize` to prevent NoSQL injection:

```bash
npm install express-mongo-sanitize
```

```javascript
const mongoSanitize = require("express-mongo-sanitize");
app.use(mongoSanitize());
```

### Suggested: Pagination on `GET /user`

`Client.find()` with no limit returns the entire collection. Add query params for `page` and `limit`:

```javascript
const { page = 1, limit = 20 } = req.query;
const users = await Client.find()
  .skip((page - 1) * limit)
  .limit(Number(limit));
```