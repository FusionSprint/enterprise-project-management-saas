# Request Response Flow

## Overview

The Request-Response cycle explains how the frontend, backend, and database communicate whenever a user performs an action.

---

## Flow Diagram

```text
User
  │
  ▼
Browser
  │
  ▼
Next.js Frontend
  │
HTTP Request (REST API)
  │
  ▼
FastAPI Backend
  │
Business Logic
  │
Validation
  │
  ▼
MongoDB
  │
Data Retrieved/Stored
  │
  ▼
FastAPI Response
  │
JSON Response
  │
  ▼
Next.js Updates UI
  │
  ▼
User Sees Result
```

---

## Example: User Login

### Step 1
User enters email and password.

↓

### Step 2
Frontend sends:

```
POST /login
```

↓

### Step 3
Backend validates the credentials.

↓

### Step 4
MongoDB checks if the user exists.

↓

### Step 5
If valid, the backend generates a JWT token.

↓

### Step 6
Backend returns a success response.

↓

### Step 7
Frontend stores the token securely and redirects the user to the dashboard.

---

## Example: Create Task

User

↓

Frontend collects task details

↓

POST `/tasks`

↓

Backend validates the request

↓

MongoDB stores the task

↓

Backend returns success

↓

Frontend updates the task list

---

## Key Components

- **Frontend:** Collects user input and displays results.
- **Backend:** Handles business logic and validation.
- **MongoDB:** Stores and retrieves application data.
- **REST API:** Enables communication between frontend and backend.

---

## Conclusion

Every action in the application follows the same Request-Response cycle. The frontend never communicates directly with MongoDB; all requests pass through the FastAPI backend, ensuring proper validation, security, and business logic.