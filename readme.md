# User Management REST API

A production-inspired RESTful API built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**.

This project demonstrates backend development fundamentals including CRUD operations, schema validation, custom business validations, centralized error handling, update restrictions, and database integration.

---

## Features

* Create User
* Fetch All Users
* Fetch User by ID
* Fetch User by Email
* Update User Information
* Delete User
* Custom Validation Logic
* Mongoose Schema Validation
* Restricted Field Updates
* Global Error Handling Middleware
* MongoDB Atlas Integration
* Automatic Timestamps

---

## Tech Stack

| Technology   | Purpose               |
| ------------ | --------------------- |
| Node.js      | Runtime Environment   |
| Express.js   | Backend Framework     |
| MongoDB      | NoSQL Database        |
| Mongoose     | ODM for MongoDB       |
| Validator.js | Password Validation   |
| dotenv       | Environment Variables |

---

## Project Architecture

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

## Installation

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

Create a `.env` file

```env
mongoStr=your_mongodb_connection_string
```

Run the application

```bash
npm run dev
```

Server runs on:

```text
http://localhost:4000
```

---

## API Endpoints

| Method | Endpoint               | Description       |
| ------ | ---------------------- | ----------------- |
| POST   | /user                  | Create User       |
| GET    | /user                  | Get All Users     |
| GET    | /user/id/:userId       | Get User By ID    |
| GET    | /user/email/:userEmail | Get User By Email |
| PATCH  | /user/:userId          | Update User       |
| DELETE | /user/:userId          | Delete User       |

---

## Sample Request

### Create User

```http
POST /user
```

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

## Validation Strategy

The application uses a combination of:

### Route-Level Validation

Business rules are validated before database operations:

* Duplicate email detection
* Strong password enforcement
* Firstname and lastname validation
* Update field restrictions

### Schema-Level Validation

Database integrity is enforced using Mongoose:

* Required fields
* Email format validation
* Phone number validation
* Gender validation
* Minimum age validation
* Automatic string formatting

This layered approach helps prevent invalid or polluted data from entering the database.

---

## Custom Validators

### Phone Number Validation

```javascript
const NUMBEREGEX = /^\d{10}$/;
```

### Email Validation

```javascript
const EMAILREGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

### Allowed Gender Values

```javascript
const ALLOWED_GENDER_VALUES = [
  "male",
  "female",
  "other"
];
```

---

## Update Restrictions

Only selected fields can be updated:

```javascript
const ALLOWED_UPDATE = [
  "firstname",
  "age",
  "profileURL",
  "skills"
];
```

Restricted fields:

```text
email
password
number
gender
```

This prevents unauthorized modification of critical user data.

---

## Error Handling

The application uses centralized error handling middleware.

Handles:

* Validation Errors
* Mongoose Errors
* Type Errors
* Custom Application Errors

Example:

```json
{
  "message": "Email is already in use"
}
```

---

## Mongoose Features Implemented

* Schema Design
* Custom Validators
* Required Fields
* Unique Constraints
* Default Values
* Min Validation
* String Normalization
* Timestamps
* runValidators on Updates

---

## Future Enhancements

* Password Hashing (bcrypt)
* JWT Authentication
* Login & Logout APIs
* Authorization Middleware
* User Profile API
* Pagination
* Search & Filtering
* Swagger Documentation
* Rate Limiting
* Refresh Tokens
* Role-Based Access Control

---

## Key Learning Outcomes

Through this project I gained hands-on experience with:

* REST API Design
* Express Routing
* MongoDB CRUD Operations
* Mongoose Models & Schemas
* Middleware Architecture
* Data Validation
* Error Handling
* Modular Project Structure
* Backend Development Best Practices

---

## Author

**Rohit Gorain**

B.Pharm Graduate transitioning into Software Development.

Currently learning and building projects using:

* Node.js
* Express.js
* MongoDB
* React
* MERN Stack
