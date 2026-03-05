# Bruin Match Login + Database Implementation Notes

## What was implemented

The authentication flow was updated so user credentials are stored in PostgreSQL and login validates against the database.

### 1) Username-based authentication
- Signup now requires `username`, `email`, and `password`.
- Login now requires `username` and `password`.
- Passwords are hashed with `bcrypt` before saving.

### 2) Database persistence
- `users` table includes a `username` column (unique).
- Signup inserts a user record into `users`.
- Login fetches by `username` and compares hash with provided password.

### 3) Server DB initialization
- Added startup DB initialization (`backend/config/initDb.js`).
- On server start, it ensures:
  - `users` table exists,
  - `username` column exists,
  - unique index on `username` exists.

### 4) Frontend updates
- Signup page includes a username field and sends:
  - `{ username, email, password }`
- Login page now sends:
  - `{ username, password }`
- Dashboard greeting uses `username` when available.

## Files changed
- `backend/routes/auth.js`
- `backend/config/initDb.js` (new)
- `backend/server.js`
- `backend/schema.sql`
- `frontend/src/pages/Signup.jsx`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Dashboard.jsx`

## How to test

## 1. Start PostgreSQL
Make sure PostgreSQL is running and the `bruin_match` database exists.

Example:
- `createdb bruin_match` (if not already created)

## 2. Configure backend environment
Create `backend/.env` with at least:

```env
PORT=3001
JWT_SECRET=replace_with_a_long_random_secret
PGUSER=your_postgres_user
PGHOST=localhost
PGDATABASE=bruin_match
PGPASSWORD=your_postgres_password
PGPORT=5432
```

## 3. Start backend
From `backend`:
- `npm install`
- `npm start`

Expected:
- Server starts on `http://localhost:3001`
- No DB initialization errors in console

## 4. Start frontend
From `frontend`:
- `npm install`
- `npm run dev`

Open the local Vite URL (usually `http://localhost:5173`).

## 5. Functional tests

### Test A: Signup stores user in DB
1. Go to Signup page.
2. Enter:
   - username: `bruin_test_1`
   - email: `bruin_test_1@ucla.edu`
   - password: `TestPass123!`
3. Submit.

Expected:
- Redirect to dashboard.
- User is logged in (token in localStorage).

DB verification:
```sql
SELECT id, username, email, created_at
FROM users
WHERE username = 'bruin_test_1';
```

You should see one row.

### Test B: Login with correct credentials
1. Log out.
2. Go to Login page.
3. Enter username `bruin_test_1` and password `TestPass123!`.
4. Submit.

Expected:
- Login successful.
- Redirect to dashboard.

### Test C: Login with wrong password
1. Enter username `bruin_test_1` and wrong password.
2. Submit.

Expected:
- Error message: invalid username/password.
- No dashboard access.

### Test D: Duplicate username/email blocked
1. Try signing up again with same username or same email.

Expected:
- Error: username or email already exists.

## 6. API quick tests (optional with curl)

Signup:
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"api_test","email":"api_test@ucla.edu","password":"TestPass123!"}'
```

Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"api_test","password":"TestPass123!"}'
```

## Notes
- Existing users created before this change may not have a username value.
- For clean testing, create new users using updated Signup flow.
