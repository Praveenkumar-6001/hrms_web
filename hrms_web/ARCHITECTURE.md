# HRMS System Architecture

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────  FRONTEND PAGES ──────────────┐               │
│  │                                              │               │
│  ├─ Home (/)              → Redirects           │               │
│  ├─ Login (/login)        → Sets JWT token     │               │
│  ├─ Signup (/signup)      → Creates user       │               │
│  ├─ Employee (/employee)  → Shows dashboard    │               │
│  └─ Admin (/admin)        → Manages requests   │               │
│                                                  │               │
│     localStorage: { token: "JWT..." }            │               │
│                                                  │               │
│     clientAuth.js                                │               │
│     ├─ setToken()    → Save JWT                 │               │
│     ├─ getToken()    → Retrieve JWT             │               │
│     ├─ parseToken()  → Decode payload           │               │
│     └─ logout()      → Clear token              │               │
│                                                  │               │
└──────────────────────────────────────────────────┘               │
                          ↕                                        │
                   HTTP Requests                                   │
              (Authorization: Bearer <token>)                      │
                          ↕                                        │
├─────────────────────────────────────────────────────────────────┤
│                    NEXT.JS SERVER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────── API ROUTES ──────────────────┐               │
│  │                                              │               │
│  ├─ POST /api/signup                           │               │
│  │   └─ Hash password → Insert user            │               │
│  │                                              │               │
│  ├─ POST /api/login                            │               │
│  │   └─ Verify → Generate JWT                  │               │
│  │                                              │               │
│  ├─ GET /api/requests  [auth required]         │               │
│  │   └─ Return user's leave requests           │               │
│  │                                              │               │
│  ├─ POST /api/requests [auth required]         │               │
│  │   └─ Insert new leave request               │               │
│  │                                              │               │
│  ├─ GET /api/admin/requests [admin only]       │               │
│  │   └─ Return all pending requests            │               │
│  │                                              │               │
│  └─ POST /api/admin/requests [admin only]      │               │
│      └─ Update request status (approve/reject) │               │
│                                                  │               │
│  ┌─────────────── MIDDLEWARE ──────────────────┐               │
│  │                                              │               │
│  └─ auth.js                                     │               │
│     └─ Verify JWT token from header            │               │
│        └─ Return payload {sub, email, role}    │               │
│                                                  │               │
└──────────────────────────────────────────────────┘               │
                          ↕                                        │
              SQL Queries (pg library)                             │
                          ↕                                        │
├─────────────────────────────────────────────────────────────────┤
│                    POSTGRESQL DATABASE                           │
│                 (Supabase: Remote DB)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────── USERS TABLE ──────────────┐                   │
│  │ id | email | password_hash | role       │                   │
│  │ 1  | emp1.com | $2a$10$... | employee   │                   │
│  │ 2  | admin.com | $2a$10$... | admin     │                   │
│  └────────────────────────────────────────┘                   │
│                                                                   │
│  ┌───────── LEAVE_REQUESTS TABLE ──────────┐                   │
│  │ id | user_id | start | end | reason | status     │           │
│  │ 1  | 1       | 2026-03-01 | 2026-03-05 | pending  │           │
│  │ 2  | 1       | 2026-04-01 | 2026-04-10 | approved │           │
│  └────────────────────────────────────────┘           │          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Authentication Flow

```
┌─────────┐
│ Signup  │
└────┬────┘
     │
     ├─ Validate: email, password
     │
     ├─ Hash password with bcryptjs
     │
     ├─ INSERT into users table
     │
     └─ Response: { id: 1 }
                    ↓
              [User created]
                    ↓
            ┌──────┴───────┐
            │              │
         Login          Email Verified
            │
            ├─ Query users WHERE email='...'
            │
            ├─ Compare password with hash (bcrypt)
            │
            ├─ IF match:
            │  ├─ Generate JWT
            │  │  ├─ Payload: {sub, email, role}
            │  │  ├─ Secret: JWT_SECRET
            │  │  ├─ Expiry: 1 hour
            │  └─ Return token
            │
            └─ IF no match: return 401
                       ↓
              [Token stored in localStorage]
                       ↓
         [Token sent in Authorization header]
                  ↓
         [Middleware verifies token]
                  ↓
         [Request processed with user context]
```

---

## 👤 Role-Based Access Control

```
                   ┌────────────────────┐
                   │      Any User      │
                   │ (Public endpoints) │
                   └─────────┬──────────┘
                             │
                      [Sign up / Login]
                             │
                    ┌────────┴────────┐
                    ├────────────────┬┤
                    │                ││
            [Employee Role]      [Admin Role]
                 │                   │
        ┌────────┴────────┐    ┌─────┴──────┐
        │                 │    │            │
    Can POST requests   Can    Can GET all  Can
    Can GET own requests VIEW   pending     Approve/
                        own    requests     Reject
                        only
```

---

## 📊 Leave Request Lifecycle

```
Step 1: Employee Submits Request
├─ Navigate to /employee
├─ Fill form (start_date, end_date, reason)
├─ Click "Submit Request"
└─ POST /api/requests with JWT

     ↓

Step 2: Request Created
├─ Server inserts to leave_requests table
├─ Status = 'pending'
└─ Response: { id: 5 }

     ↓

Step 3: Request Appears in Employee Dashboard
├─ GET /api/requests returns all employee's requests
├─ Status shown as: PENDING (orange)
└─ Employee can view request details

     ↓

Step 4: Admin Notification
├─ Admin logs in
├─ Navigates to /admin
├─ GET /api/admin/requests fetches all pending
└─ Table shows email, dates, reason

     ↓

Step 5: Admin Approves/Rejects
├─ Admin clicks "Approve" or "Reject"
├─ POST /api/admin/requests { id, action }
├─ Status updated to 'approved' or 'rejected'
└─ Request removed from admin view

     ↓

Step 6: Employee Sees Update
├─ Employee refreshes dashboard
├─ GET /api/requests shows updated status
└─ Status color changed:
   - Approved: GREEN
   - Rejected: RED
```

---

## 🔐 Security Layers

```
┌────────────────────────────────────────┐
│     APPLICATION SECURITY LAYERS       │
├────────────────────────────────────────┤
│                                        │
│ Layer 1: Password Security             │
│ └─ bcryptjs hashing (10 rounds)        │
│    └─ Stored as: $2a$10$...           │
│    └─ Compared on login                │
│                                        │
│ Layer 2: Token Security                │
│ └─ JWT signed with JWT_SECRET          │
│ └─ Exp: 1 hour (short-lived)           │
│ └─ Payload read-only (if tampered)     │
│                                        │
│ Layer 3: Request Validation            │
│ └─ Verify JWT in Authorization header  │
│ └─ Extract user context                │
│ └─ Deny if invalid/missing             │
│                                        │
│ Layer 4: Role-Based Access             │
│ └─ Check user.role === 'admin'         │
│ └─ Deny if role doesn't match          │
│ └─ Applied on admin endpoints          │
│                                        │
│ Layer 5: SQL Injection Prevention      │
│ └─ Parameterized queries               │
│ └─ $1, $2 placeholders (pg library)    │
│ └─ Never concatenate user input        │
│                                        │
└────────────────────────────────────────┘
```

---

## 📦 Component Interaction

```
┌────────────────────────────────────────────────────┐
│                  _app.js (Wrapper)                 │
│              [Global styles + Router]              │
└──────────────┬───────────────────────────────────┘
               │
     ┌─────────┼─────────┬─────────┬─────────┐
     │         │         │         │         │
   index    login    signup   employee   admin
     │         │         │         │         │
     └─────────┴────┬────┴────┬────┴────┬────┘
                    │         │         │
                Nav.js     clientAuth  localStorage
                    │         │         │
         [Displays user]  [Token ops] [Persist data]
```

---

## 🔗 Data Flow: New Leave Request

```
User Input (Employee Dashboard)
    ↓
Form Submit Event
    ↓
POST /api/requests
  ├─ Headers: { Authorization: "Bearer <JWT>" }
  ├─ Body: { start_date, end_date, reason }
    ↓
auth.js Middleware
  ├─ Verify JWT token
  ├─ Extract user.id
    ↓
Handler Function
  ├─ Validate input (dates, reason)
  ├─ Query: INSERT into leave_requests
  ├─ Parameters: (user_id, start_date, end_date, reason, 'pending')
    ↓
PostgreSQL
  ├─ Insert row
  ├─ SERIAL id auto-generated
    ↓
Response
  ├─ Status: 201 Created
  ├─ Body: { id: 5 }
    ↓
Frontend Handler
  ├─ Update local state
  ├─ Add to requests array
  ├─ Clear form inputs
  ├─ Re-render table
    ↓
User Sees
  ├─ New request in table
  ├─ Status: pending (orange)
```

---

## 🚀 Deployment Flow (Production)

```
Development
    ↓
npm run build
    ├─ Compile React → HTML/JS
    ├─ Compile API routes
    ├─ Optimize assets
    └─ Generate .next folder
    ↓
Testing
    ├─ npm start (test built version)
    ├─ Verify all pages
    ├─ Test API endpoints
    ↓
Deploy to Vercel / NodeJS Server
    ├─ Push to git
    ├─ Set environment variables
    ├─ Run build
    ├─ Start server
    ↓
Production
    ├─ API available on domain
    ├─ Use HTTPS
    ├─ DB connection secure
    ├─ Monitor logs
```

---

## 📈 Performance Considerations

| Item | Optimization |
|------|--------------|
| Package Size | Only essential deps (no bloat) |
| API Response | JSON serialized (fast) |
| Database Queries | Indexed lookups by email/id |
| Token Storage | localStorage (client-side) |
| CSS | Inline (no extra requests) |
| Build Size | ~80-85 KB JS shared |

---

## 🛠️ Technology Decision Matrix

| Aspect | Choice | Why |
|--------|--------|-----|
| Framework | Next.js | Full-stack, serverless APIs |
| Language | JavaScript | Requested, fast to develop |
| Database | PostgreSQL | Reliable, ACID compliant |
| Auth | JWT | Stateless, scalable |
| Password | bcryptjs | Industry standard for Node.js |
| Styling | CSS | Simple, no dependencies |

---

This architecture is:
✅ Scalable (serverless on Vercel/AWS)  
✅ Secure (multiple auth layers)  
✅ Simple (easy to understand)  
✅ Maintainable (clean code)  
✅ Production-ready (error handling included)  
