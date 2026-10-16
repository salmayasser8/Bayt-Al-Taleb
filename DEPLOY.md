# 🚀 Deployment Guide — Bayt Al-Taleb

Stack: **React (Vite)** frontend · **Express + Prisma** backend · **PostgreSQL (Neon)** database.

Recommended free hosting: **Neon** (DB) · **Render** (backend) · **Netlify or Vercel** (frontend).

---

## 0. Why the seed failed (`P2021: table "public.permissions" does not exist`)

The seed ran against a database where the migrations had **not** been applied.

Two separate connections are involved:

| Env var        | Used by                          |
| -------------- | -------------------------------- |
| `DATABASE_URL` | The app + `prisma db seed`       |
| `DIRECT_URL`   | `prisma migrate deploy` (no pool)|

**The trap:** if you point `DATABASE_URL` at Neon but leave `DIRECT_URL` on
`localhost`, then:

- `prisma migrate deploy` runs against **localhost** → "up to date", creates nothing on Neon
- `prisma db seed` runs against **Neon** → tables don't exist → `P2021`

### The rule

> Whenever you change `DATABASE_URL`, you **must** set `DIRECT_URL` to the same
> database, then run `prisma migrate deploy` **before** `prisma db seed`.

### Correct order (against Neon)

```bash
cd backend

# 1. Point BOTH urls at Neon in backend/.env
#    DATABASE_URL = Neon pooled url   (host contains "-pooler")
#    DIRECT_URL   = Neon direct url   (same host WITHOUT "-pooler")

# 2. Apply all migrations (creates every table)
npx prisma migrate deploy

# 3. Verify migrations are applied
npx prisma migrate status        # -> "Database schema is up to date!"

# 4. Seed roles, permissions, and default users
npx prisma db seed

# 5. (optional) search indexes
npm run search:indexes
```

Default seeded logins:

| Email                  | Password        | Role        |
| ---------------------- | --------------- | ----------- |
| superadmin@bayt.com    | SuperAdmin@123  | SUPER_ADMIN |
| admin@bayt.com         | Admin@123       | ADMIN       |
| moderator@bayt.com     | Moderator@123   | MODERATOR   |

---

## 1. Database — Neon

1. Create a project at <https://neon.tech> (free tier).
2. Open **Connection Details** and copy **both** strings:
   - **Pooled connection** → `DATABASE_URL`
   - **Direct connection** → `DIRECT_URL`
3. Keep `?sslmode=require` at the end of each.

---

## 2. Backend — Render

1. New → **Web Service** → connect your GitHub repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install --include=dev && npm run build`
     > `--include=dev` is required because the build needs `typescript`/`tsc`.
   - **Start Command:** `npm run start:prod`
     > runs `prisma migrate deploy` then `node dist/src/server.js`
3. **Environment variables:**

   ```
   NODE_ENV=production
   DATABASE_URL=<Neon pooled url>?sslmode=require
   DIRECT_URL=<Neon direct url>?sslmode=require
   API_PREFIX=/api/v1
   JWT_ACCESS_SECRET=<random 32+ chars>
   JWT_REFRESH_SECRET=<random 32+ chars>
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   BCRYPT_SALT_ROUNDS=12
   CORS_ORIGIN=https://<your-frontend-domain>
   LOG_LEVEL=info
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE_MB=25

   # REQUIRED by config/env.ts — the server refuses to boot without them.
   # Use real Google OAuth creds, or dummy values if you don't use Google login.
   GOOGLE_CLIENT_ID=change-me
   GOOGLE_CLIENT_SECRET=change-me
   GOOGLE_CALLBACK_URL=https://<backend-domain>/api/v1/auth/google/callback
   ```

4. First deploy, then run the seed **once** from the Render **Shell**:
   ```bash
   npx prisma db seed
   ```

> ⚠️ **File uploads:** the free tier has an **ephemeral disk** — files written to
> `UPLOAD_DIR` are lost on every restart/redeploy. For a permanent solution use
> a Render Disk (paid) or move uploads to cloud storage (Cloudinary/S3).

---

## 3. Frontend — Netlify or Vercel

Both need the SPA rewrite so React Router works on refresh
(already added: `frontend/public/_redirects` and `frontend/vercel.json`).

**Netlify**
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist`
- Env var: `VITE_API_BASE_URL=https://<backend-domain>/api/v1`

**Vercel**
- Root directory: `frontend`
- Framework preset: Vite (build `npm run build`, output `dist`)
- Env var: `VITE_API_BASE_URL=https://<backend-domain>/api/v1`

4. After the frontend is live, set the backend's `CORS_ORIGIN` to the
   frontend URL and redeploy the backend.

---

## 4. Checklist

- [ ] `backend/.env` (or Render env) has **both** `DATABASE_URL` **and** `DIRECT_URL` on Neon
- [ ] `npx prisma migrate deploy` → "up to date"
- [ ] `npx prisma db seed` → success
- [ ] `npm run build` passes in `backend/` and `frontend/`
- [ ] Backend `CORS_ORIGIN` = deployed frontend URL
- [ ] Frontend `VITE_API_BASE_URL` = `https://<backend>/api/v1`
- [ ] Google OAuth vars set (real or dummy) or the backend won't boot
