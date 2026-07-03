# 🏗️ System Architecture

## Overview

The **Enterprise Project Management SaaS** follows a modern **3-Tier Architecture** consisting of:

* **Presentation Layer (Frontend)**
* **Application Layer (Backend)**
* **Data Layer (Database)**

Each layer has a specific responsibility, making the application scalable, maintainable, and easy to develop collaboratively.

---

# High-Level Architecture

```text
                         User
                          │
                          ▼
                  Web Browser (Chrome)
                          │
                          ▼
          Next.js + React + TypeScript
          (Frontend Presentation Layer)
                          │
              HTTPS / REST API Requests
                          │
                          ▼
                  FastAPI (Backend)
        ┌───────────────────────────────────┐
        │ Authentication (JWT)              │
        │ Authorization (RBAC)              │
        │ Business Logic                    │
        │ Request Validation                │
        │ API Endpoints                     │
        │ Database Operations               │
        │ File Upload Handling              │
        │ Real-Time Event Handling          │
        └───────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
 PostgreSQL Database              Cloudinary Storage
 (Persistent Data)                (Files & Images)
          │
          ▼
      Query Results
          │
          ▼
      FastAPI Response (JSON)
          │
          ▼
 Next.js Updates User Interface
          │
          ▼
          User
```

---

# Architecture Layers

## 1. Presentation Layer (Frontend)

### Technology

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

### Responsibilities

* Display pages and components
* Handle user interactions
* Form validation
* Send API requests
* Display API responses
* Manage client-side state
* Navigate between pages

Examples

* Login Page
* Dashboard
* Workspace Page
* Project Page
* Kanban Board
* Analytics Dashboard

---

## 2. Application Layer (Backend)

### Technology

* FastAPI

### Responsibilities

* Authenticate users
* Authorize requests
* Validate incoming data
* Execute business logic
* Process API requests
* Connect with PostgreSQL
* Handle file uploads
* Generate JWT tokens
* Return JSON responses

Example APIs

* POST /register
* POST /login
* GET /projects
* POST /tasks
* PUT /tasks/{id}
* DELETE /tasks/{id}

---

## 3. Data Layer

### Technology

* PostgreSQL

### Responsibilities

Store application data including:

* Users
* Workspaces
* Teams
* Projects
* Tasks
* Comments
* Notifications
* Activity Logs

---

## File Storage

### Technology

* Cloudinary

Used for storing:

* User profile pictures
* Project attachments
* Documents
* Images

Instead of storing files inside PostgreSQL, only the file URL is stored in the database.

---

## Authentication

### Technology

* JWT (JSON Web Token)

Authentication Flow

User Login

↓

FastAPI verifies credentials

↓

JWT Token Generated

↓

Frontend stores token securely

↓

Token sent with every protected request

↓

Backend validates token

↓

Access Granted

---

## Real-Time Communication

### Technology

* Socket.IO

Used for:

* Live notifications
* Real-time comments
* Task updates
* Activity updates
* Team collaboration

---

# Request Flow

Example: Creating a Task

```text
User Clicks "Create Task"

        │

        ▼

Next.js Form

        │

        ▼

POST /tasks

        │

        ▼

FastAPI

        │

Validate Request

        │

Business Logic

        │

Store in PostgreSQL

        │

Return JSON Response

        │

Next.js Updates Dashboard

        │

Socket.IO Notifies Team Members

        │

Task Appears Instantly
```

---

# Security Flow

* JWT Authentication
* Role-Based Access Control (RBAC)
* Request Validation
* Password Hashing
* Protected API Routes
* Environment Variables
* HTTPS Communication

---

# Deployment Architecture

```text
Browser

     │

     ▼

Vercel
(Frontend)

     │

REST API

     ▼

Render / Railway
(FastAPI Backend)

     │

     ▼

PostgreSQL Database

     │

     ▼

Cloudinary Storage
```

---

# Why This Architecture?

This architecture separates responsibilities into different layers.

Advantages:

* Easy to maintain
* Scalable
* Secure
* Reusable
* Easy for multiple developers to collaborate
* Industry-standard architecture
* Suitable for production-ready SaaS applications

---

# Future Enhancements

* Redis Caching
* Background Workers (Celery)
* AI Task Prioritization
* GitHub Integration
* Calendar Integration
* Slack/MS Teams Integration
* Kubernetes Deployment
* Microservices Architecture
* Monitoring & Logging

---

# Summary

The Enterprise Project Management SaaS follows a modern layered architecture where:

* **Next.js** provides the user interface.
* **FastAPI** handles business logic and APIs.
* **PostgreSQL** stores application data.
* **Cloudinary** stores uploaded files.
* **Socket.IO** enables real-time collaboration.
* **JWT** secures authentication.
* **Docker** ensures consistent environments.
* **GitHub Actions** automates CI/CD.
* **Vercel** hosts the frontend application.

This architecture follows industry best practices for building scalable, secure, and maintainable full-stack SaaS applications.
