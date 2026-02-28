```

HRMS PROJECT API FLOW & ARCHITECTURE
====================================

1. AUTHENTICATION FLOW
- Signup: POST /api/signup { email, password } → user created with "employee" role
- Login: POST /api/login { email, password } → JWT token issued with { sub, email, role }
- Token stored in localStorage on client; sent in Authorization header: "Bearer <token>"

2. DATABASE SCHEMA
  users table:
    - id (primary key)
    - email (unique)
    - password_hash
    - role ('admin' or 'employee')

  leave_requests table:
    - id (primary key)
    - user_id (foreign key to users)
    - start_date
    - end_date
    - reason
    - status ('pending', 'approved', 'rejected')

3. API ENDPOINTS

  [EMPLOYEE]
  - POST /api/signup
    Input: { email, password }
    Output: { id }
  
  - POST /api/login
    Input: { email, password }
    Output: { token }
  
  - POST /api/requests
    Headers: Authorization: Bearer <token>
    Input: { start_date, end_date, reason }
    Output: { id }
    Creates a leave request in 'pending' status
  
  - GET /api/requests
    Headers: Authorization: Bearer <token>
    Output: [ { id, start_date, end_date, reason, status }, ... ]
    Lists all requests for the logged-in user

  [ADMIN]
  - GET /api/admin/requests
    Headers: Authorization: Bearer <token> (admin only)
    Output: [ { id, email, start_date, end_date, reason, status }, ... ]
    Lists all 'pending' requests from all employees

  - POST /api/admin/requests
    Headers: Authorization: Bearer <token> (admin only)
    Input: { id, action } where action = 'approve' or 'reject'
    Output: { status } (updated to 'approved' or 'rejected')

4. FRONTEND PAGES

  - /  (Home)
    Shows login/signup links if not authenticated
    Shows user email and role if authenticated
    Navigation to /admin or /employee based on role

  - /signup
    Form with email and password input
    Calls POST /api/signup on submit
    Redirects to /login on success

  - /login
    Form with email and password input
    Calls POST /api/login on submit
    Stores JWT in localStorage
    Redirects to / on success

  - /employee
    Protected page for employees
    Form to request leave (start_date, end_date, reason)
    Table showing their leave requests with status
    Logout button

  - /admin
    Protected page for admins (role check)
    Table showing all pending leave requests
    Action buttons: Approve / Reject
    Auto-removes approved/rejected requests from table
    Logout button

5. AUTH FLOW ON CLIENT
  - setToken(token): saves JWT to localStorage
  - getToken(): retrieves JWT from localStorage
  - parseToken(): decodes JWT payload (email, sub, role)
  - logout(): clears localStorage

6. AUTH FLOW ON SERVER
  - auth() middleware: reads Authorization header
    Parses "Bearer <token>" and verifies with JWT_SECRET
    Returns decoded payload { sub, email, role }
    Rejects if invalid or missing

7. ROLE-BASED ACCESS CONTROL
  - Employee can only:
    * View own leave requests
    * Create new leave requests
    * Cannot view or manage other employees' requests

  - Admin can:
    * View all pending leave requests
    * Approve/reject any request
    * Cannot create leave requests themselves

8. STYLING
  Non-comment CSS in styles/globals.css
  Tables with borders and padding
  Forms with full-width inputs
  Navigation bar with links

```
