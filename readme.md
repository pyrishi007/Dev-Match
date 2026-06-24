# User Management API — Production Documentation

**Version:** 1.1.0  
**Base URL:** `http://<host>:4000`  
**Protocol:** HTTP/HTTPS  
**Data Format:** JSON

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Environment Setup](#environment-setup)
4. [Data Model](#data-model)
5. [Validation Rules](#validation-rules)
6. [API Endpoints](#api-endpoints)
7. [Error Handling](#error-handling)
8. [Constants & Configuration](#constants--configuration)
9. [Security Considerations](#security-considerations)
10. [Known Limitations & Improvements](#known-limitations--improvements)

---

## Overview

This is a RESTful backend API built with **Node.js**, **Express.js**, and **MongoDB (via Mongoose)**. It provides full CRUD (Create, Read, Update, Delete) operations for managing user (Client) records, with schema-level and application-level validation.

**Tech Stack:**

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| ODM | Mongoose |
| Database | MongoDB |
| Validation | Mongoose schema validators + custom middleware + `validator` npm package |
| Config | `dotenv` |

---

## Architecture

```
project-root/
├── app.js                  # Entry point — Express app, routes, server bootstrap
├── config/
│   └── database.js         # MongoDB connection logic
├── middleware/
│   └── errorHandler.js     # Global error handling middleware
├── models/
│   └── user.model.js       # Mongoose schema and model (Client)
└── Utils/
    ├── CONSTANTS.js         # Regex patterns and allowed value lists
    ├── password.js          # Password hashing utility (bcrypt)
    └── validations.js       # Application-level validation functions
```

**Request Lifecycle:**

```
Client Request
     │
     ▼
Express Router (app.js)
     │
     ▼
Application Validation (Utils/validations.js)   ← runs before DB ops
     │
     ▼
Password Hashing (Utils/password.js)            ← POST /user only
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
node app.js
```

The server starts on **port 4000** by default. On successful startup:

```
DB connection successful
Server is up and running on 4000
```

---

## Data Model

### Collection: `clients`

Defined in `models/user.model.js` via `clientSchema`.

| Field | Type | Required | Unique | Constraints |
|---|---|---|---|---|
| `firstname` | String | ✅ | — | Min 4 characters (app-level) |
| `lastname` | String | — | — | Min 4 characters if provided (app-level) |
| `dob` | Date/String | — | — | Date of birth; no schema-level constraint currently |
| `number` | String | ✅ | ✅ | Must match `/^\d{10}$/` — exactly 10 digits |
| `email` | String | ✅ | — | Lowercase, trimmed, must match email regex; must be unique (app-level check) |
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

### 1. Application-Level (Utils/validations.js)

Executed before any database operation. Errors thrown here propagate to the global error handler.

#### On POST `/user` — `SignUpValidation(req)`

| Rule | Condition | Error Message |
|---|---|---|
| Name required | Neither `firstname` nor `lastname` provided | `"Please provide either a firstname or lastname."` |
| Min length — firstname | `firstname` present but < 4 chars | `"Please provide minimum 4 characters in firstname"` |
| Min length — lastname | `lastname` present but < 4 chars | `"Please provide minimum 4 characters in lastname"` |
| Password required | `password` missing | `"Password is required"` |
| Strong password | Password doesn't meet `isStrongPassword()` criteria | `"Password does not meet the security requirements."` |
| Unique email | `email` already exists in DB | `"Email is already in use"` |

> `validator.isStrongPassword()` defaults: min 8 chars, at least 1 lowercase, 1 uppercase, 1 number, 1 symbol.

#### On PATCH `/user/:id` — `updateValidation(req)`

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
| `number` | `/^\d{10}$/` regex |
| `email` | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` regex |
| `age` | Minimum value: `18` |
| `gender` | Must be in `["male", "female", "other"]` |

---

## API Endpoints

### POST `/user`
**Create a new user**

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

**Processing order (inside try/catch):**
1. `SignUpValidation(req)` — runs all application-level checks
2. `encrptPassword(password)` — hashes the plaintext password via `Utils/password.js`
3. `Client({...}).save()` — persists the document with the hashed password

**Success Response — `200 OK`:**

Returns the saved Mongoose document (full object including `_id`, `createdAt`, `updatedAt`). The `password` field in the response will be the bcrypt hash, not the plaintext value.

**Error Responses:**

| Status | Cause |
|---|---|
| `400` | Mongoose `ValidationError` (schema-level failure) |
| `500` | Duplicate key (`number`), application validation error, or any unhandled error |

---

### GET `/user`
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

### GET `/user/id/:id`
**Retrieve a user by MongoDB ObjectId**

**URL Parameter:**

| Param | Type | Description |
|---|---|---|
| `id` | String | Valid MongoDB ObjectId |

**Success Response — `200 OK`:** The user document, or `null` if not found.

**Error Response:**

| Status | Cause |
|---|---|
| `500` | Invalid ObjectId format (Mongoose `CastError`) |

---

### GET `/user/email/:email`
**Retrieve a user by email address**

**URL Parameter:**

| Param | Type | Description |
|---|---|---|
| `email` | String | Email address of the user |

**Success Response — `200 OK`:** The user document, or `null` if not found.

---

### DELETE `/user/:id`
**Delete a user by MongoDB ObjectId**

**URL Parameter:**

| Param | Type | Description |
|---|---|---|
| `id` | String | Valid MongoDB ObjectId |

**Success Response — `200 OK`:**

```
User successfully deleted : { _id: '...', firstname: 'Rohit', ... }
```

Returns `null` in the message if no user was found with that ID (no error thrown).

---

### PATCH `/user/:id`
**Partially update a user by MongoDB ObjectId**

**URL Parameter:**

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
- `runValidators: true` — re-runs schema validators on the patched fields

**Success Response — `200 OK`:**

Returns the updated Mongoose document as a JSON object (not a string):

```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "firstname": "UpdatedName",
  "age": 30,
  ...
}
```

**Error Responses:**

| Status | Cause |
|---|---|
| `400` | Schema validation failure on patched fields |
| `500` | Disallowed field in body (`"Update not allowed"`), invalid ObjectId, or unhandled error |

---

## Error Handling

All errors are caught via `next(err)` and routed to the global error handler in `middleware/errorHandler.js`.

### Error Response Format

Responses are plain text strings in this format:

```
<ErrorType>: <ERROR_NAME>
Error Message: <err.message>
```

### Handled Error Types

| Error Name | HTTP Status | Trigger |
|---|---|---|
| `ValidationError` | `400` | Mongoose schema validation failed |
| `TypeError` | `500` | Null/undefined access, wrong type operations |
| `ReferenceError` | `500` | Access to undefined variables |
| Any other error | `500` | Fallback anonymous handler |

### Example Error Responses

**400 — Validation failure:**
```
Bad request: VALIDATIONERROR
Error Message: Client validation failed: age: Path `age` (16) is less than minimum allowed value (18).
```

**500 — Update not allowed:**
```
Error: ERROR
Error Message: Update not allowed
```

---

## Constants & Configuration

Defined in `Utils/CONSTANTS.js`:

| Constant | Value | Used For |
|---|---|---|
| `NUMBEREGEX` | `/^\d{10}$/` | 10-digit phone number validation |
| `EMAILREGEX` | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | Basic email format validation |
| `PASSWORD_REGEX` | `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])...$/` | Defined but not currently used in routes |
| `ALLOWED_GENDER_VALUES` | `["male", "female", "other"]` | Gender field validation |
| `ALLOWED_UPDATE` | `["firstname", "age", "profileURL", "skills"]` | PATCH field whitelist |

**DNS Configuration:**

The app sets DNS servers at startup for improved resolution reliability:

```javascript
dns.setServers(["1.1.1.1", "8.8.8.8"]); // Cloudflare, Google
```

---

## Security Considerations

The following are **current gaps** that must be addressed before deploying to production:

| Issue | Risk | Status |
|---|---|---|
| ~~Passwords stored in plaintext~~ | ~~🔴 Critical~~ | ✅ Fixed — bcrypt hashing via `Utils/password.js` |
| No authentication/authorization | 🔴 Critical | Add JWT or session-based auth middleware |
| `GET /user` returns all users | 🟠 High | Add pagination and restrict to admin roles |
| `email` not enforced unique at DB level | 🟠 High | Add `unique: true` to the email field in schema |
| No rate limiting | 🟠 High | Add `express-rate-limit` middleware |
| Error messages expose internal details | 🟡 Medium | Return generic messages to clients; log internals only |
| No HTTPS enforcement | 🟡 Medium | Use a reverse proxy (nginx) with TLS in production |
| `errorMonitor` imported but unused | 🟢 Low | Remove the unused import from `app.js` |
| `PASSWORD_REGEX` defined but unused | 🟢 Low | Use it in schema-level validation or remove it |

---

## Known Limitations & Improvements

### ✅ Fixed: Unhandled Validation Errors on POST

Previously `SignUpValidation(req)` was called outside the `try/catch` block, causing unhandled promise rejections. This has been resolved — the full handler is now wrapped in a single try/catch:

```javascript
app.post("/user", async (req, res, next) => {
  try {
    await SignUpValidation(req);
    const hashPassword = await encrptPassword(req.body.password);
    const user = await Client({ ...fields, password: hashPassword }).save();
    res.send(user);
  } catch (err) {
    next(err);
  }
});
```

### Missing: 404 Handling

When a user is not found by ID or email, the API currently returns `null` with a `200` status. A proper 404 response should be returned:

```javascript
if (!user) return res.status(404).send("User not found");
```

### Missing: Input Sanitization

Request body fields are passed directly to Mongoose without sanitization. Consider using `express-mongo-sanitize` to prevent NoSQL injection attacks.

### Suggested: Pagination on GET /user

`Client.find()` with no limit will return the entire collection. Add query params for `page` and `limit`:

```javascript
const { page = 1, limit = 20 } = req.query;
const users = await Client.find()
  .skip((page - 1) * limit)
  .limit(Number(limit));
```