# DSA Log API (Week 3: Back-End API Development)

RESTful back end for the DSA Log front-end app. Users register, log in, and manage their DSA topics, practice problems, notes and progress.

**Stack:** Node.js, Express 5, SQLite (better-sqlite3), JWT, bcryptjs, Zod, Helmet.

## Features
- Secure authentication with hashed passwords and JWT.
- Full CRUD for topics and problems, plus a stats endpoint.
- Input validation on every route, consistent JSON errors.
- Per-user data isolation, rate limiting on auth routes.
- 14 automated tests (Node's built-in test runner + supertest).
- Full API documentation in [`docs/API.md`](docs/API.md).

## Setup and run
Requires Node.js 18 or newer.

```bash
npm install
cp .env.example .env      # on Windows PowerShell: copy .env.example .env
# edit .env and set JWT_SECRET to a long random string
npm start                 # http://localhost:3000
```
Development with auto-restart: `npm run dev`. The SQLite file is created automatically in `data/`.
Check it works: open http://localhost:3000/api/health.

## Run the tests
```bash
npm test
```
Tests use an in-memory database, so they never touch real data.

## Environment variables
| Variable | Default | Purpose |
|----------|---------|---------|
| PORT | 3000 | Server port |
| JWT_SECRET | dev-only value | Token signing key. **Required in production** (server refuses to start without it) |
| JWT_EXPIRES_IN | 1h | Token lifetime |
| DB_PATH | ./data/dsa-log.db | SQLite file |
| CORS_ORIGIN | * | Allowed front-end origin |
| BCRYPT_ROUNDS | 10 | Password hashing cost |

## Project structure
```
src/
  server.js        starts the server, graceful shutdown
  app.js           builds the Express app (middleware + routes)
  config.js        environment config
  db.js            SQLite connection and schema
  seed.js          default topics for new users
  middleware/      auth (JWT), validate (Zod), errors
  routes/          auth, topics, problems, stats
tests/api.test.js  integration tests
docs/API.md        API documentation
```

## Database schema
```
users (id, name, email UNIQUE, password_hash, created_at)
  1 --- * topics (id, user_id FK, title, description, notes, created_at)
            1 --- * problems (id, topic_id FK, name, level CHECK Easy|Medium|Hard, solved CHECK 0|1, created_at)
```
Foreign keys use `ON DELETE CASCADE`, so deleting a topic removes its problems.

## Security measures
- Passwords hashed with bcrypt (never stored or returned in plain text).
- JWT signed with HS256, verified on every protected request; the user is re-checked in the database.
- Login returns one generic error for wrong email or password.
- Parameterised SQL everywhere (no string-built queries), preventing SQL injection.
- Zod validation with strict schemas: unknown fields, wrong types and oversized values are rejected.
- Users can only access their own data; other users' records return 404.
- Helmet security headers, 10 KB body limit, rate limiting on `/api/auth`.
- Unexpected errors return a generic 500 and are logged on the server only.

## Design decisions
- **SQLite** keeps setup to a single `npm install`, with a real relational schema and constraints.
- **Layered structure:** app wiring, routes, middleware and database are separate, and `createApp(db)` accepts a database so tests can inject an in-memory one.
- **One error format** for every failure so the front end can handle errors in one place.

## Connecting the front end
The Week 2 front end currently stores data in `localStorage` through `js/store.js`. Replace its functions with `fetch()` calls to this API (send the token in the `Authorization` header) to switch to the real back end.

## Limitations / future work
- Tokens are not revocable before expiry (no refresh tokens or logout list).
- No email verification or password reset.
- SQLite suits a single server; a larger deployment would move to PostgreSQL.
