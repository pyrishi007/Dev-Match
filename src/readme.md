# User Management REST API

A RESTful CRUD API built using **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**. This project demonstrates backend development concepts such as data validation, schema design, error handling, update restrictions, and MongoDB integration.

---

# Features

* Create User
* Fetch All Users
* Update User
* Delete User
* Mongoose Schema Validation
* Custom Regex Validation
* Global Error Handling Middleware
* Restricted User Updates
* MongoDB Integration
* Timestamps Support

---

# Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose

---

# Project Structure

```text
src
│
├── config
│   └── database.js
│
├── middleware
│   └── errorHandler.js
│
├── models
│   └── user.model.js
│
├── Utils
│   ├── CONSTANTS.js
│   └── validations.js
│
└── app.js
```

---

# Installation

Clone the repository

```bash
git clone <repository-url>
```

Navigate to project directory

```bash
cd project-name
```

Install dependencies

```bash
npm install
```

Start server

```bash
npm run dev
```

---

# API Endpoints

## Create User

Creates a new user.

### Request

```http
POST /user
```

### Sample Body

```json
{
  "firstname": "Rohit",
  "lastname": "Gorain",
  "number": "9876543210",
  "email": "rohit@gmail.com",
  "password": "Rohit@123",
  "age": 24,
  "gender": "male",
  "skills": ["NodeJS", "MongoDB"]
}
```

---

## Get All Users

Returns all users stored in MongoDB.

### Request

```http
GET /user
```

---

## Update User

Updates allowed user fields.

### Request

```http
PATCH /user/:userId
```

### Allowed Update Fields

```javascript
const ALLOWED_UPDATE = [
  "firstname",
  "age",
  "profileURL",
  "skills",
];
```

### Example

```json
{
  "age": 25,
  "skills": ["ExpressJS", "MongoDB"]
}
```

---

## Delete User

Deletes a user by MongoDB ObjectId.

### Request

```http
DELETE /user/:userId
```

---

# User Schema

```javascript
{
  firstname: String,
  lastname: String,
  number: String,
  email: String,
  password: String,
  age: Number,
  gender: String,
  profileURL: String,
  skills: [String]
}
```

---

# Validation Rules

## Phone Number Validation

Only 10-digit phone numbers are accepted.

```javascript
const NUMBEREGEX = /^\d{10}$/;
```

### Valid

```text
9876543210
```

### Invalid

```text
98765
abcd123456
```

---

## Email Validation

Validates email format.

```javascript
const EMAILREGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

### Valid

```text
rohit@gmail.com
```

### Invalid

```text
rohitgmail.com
rohit@
```

---

## Password Validation

Password must contain:

* At least one uppercase letter
* At least one lowercase letter
* At least one number
* At least one special character
* Minimum 8 characters

```javascript
const PASSWORD_REGEX =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
```

### Valid

```text
Rohit@123
NodeJS@2025
```

### Invalid

```text
rohit123
ROHIT@123
Password
```

---

## Gender Validation

Allowed values:

```javascript
const ALLOWED_GENDER_VALUES = [
  "male",
  "female",
  "other",
];
```

---

# Update Validation

To prevent unauthorized field updates, the application validates all incoming update requests.

```javascript
const updateValidation = (req) => {
  const isUpdateAllowed = Object.keys(req.body).every(
    (eachKey) =>
      ALLOWED_UPDATE.includes(eachKey)
  );

  if (!isUpdateAllowed) {
    throw new Error("Update not allowed");
  }
};
```

### Why?

This prevents users from updating restricted fields such as:

```text
email
number
gender
password
```

through the generic update endpoint.

---

# Error Handling

A centralized error handling middleware is implemented.

```javascript
app.use(errorHandler);
```

Handles:

* ValidationError
* TypeError
* ReferenceError
* Generic Errors

### Example Response

```text
Bad request: VALIDATIONERROR

Error Message: Email is not valid
```

---

# Mongoose Features Used

### Required Fields

```javascript
required: true
```

### Unique Constraints

```javascript
unique: true
```

### Minimum Age Validation

```javascript
min: 18
```

### String Formatting

```javascript
lowercase: true
trim: true
```

### Automatic Timestamps

```javascript
{
  timestamps: true
}
```

Automatically generates:

```javascript
createdAt
updatedAt
```

---

# Future Improvements

* JWT Authentication
* Password Hashing using bcrypt
* User Login API
* User Profile API
* Pagination
* Rate Limiting
* Swagger Documentation
* Role-Based Authorization
* Refresh Tokens

---

# Learning Outcomes

This project helped in understanding:

* Express Routing
* REST API Design
* MongoDB CRUD Operations
* Mongoose Schema Validation
* Custom Validators
* Error Handling Middleware
* Route-Level Validation
* Modular Project Structure
* Backend Best Practices

---

# Author

**Rohit Gorain**

B.Pharm Graduate | MERN Stack Developer | Learning Backend Development with Node.js, Express.js, MongoDB, and Mongoose.
