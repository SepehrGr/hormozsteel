# Hormoz Steel — English portfolio demo

B2B steel pricing catalog rebuilt as an **English** portfolio showcase.

This is **not** the live client site. It uses a **dedicated database** (`ahanhormoz_demo`).

| Stack | |
|-------|--|
| Framework | Next.js (App Router), TypeScript |
| Data | Prisma + PostgreSQL |
| Auth | NextAuth.js (credentials + bcrypt) |
| UI | HeroUI, Tailwind, icomoon icons |

**Role:** Solo full-stack frontend — catalog, pricing, admin, auth.

---

## Quick start

```bash
# 1. Create demo database (once, via psql)
CREATE DATABASE ahanhormoz_demo;

# 2. Environment: create `.env.local` (the app) and `.env` (Prisma CLI) with
#   DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/ahanhormoz_demo?schema=public"
#   NEXTAUTH_URL="http://localhost:3000"
#   NEXTAUTH_SECRET="<a long random string>"
# Both must point at ahanhormoz_demo

# 3. Install + schema + seed
yarn
yarn prisma migrate deploy
yarn db:seed

# 4. Run
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo admin

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@hormozsteel.demo` | `admin123` |
| Super Admin | `superadmin@hormozsteel.demo` | `superadmin123` |

Admin panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Seed creates ~78 English products (rebar, beams, sheets, profiles, pipes, wire, mesh, billets, tubes).

---

## Scripts

| Command | Purpose |
|---------|---------|
| `yarn dev` | Dev server |
| `yarn build` / `yarn start` | Production build |
| `yarn db:generate` | Generate Prisma Client |
| `yarn db:migrate` | Create + apply a migration after a schema edit |
| `yarn db:seed` | English catalog seed (**refuses** non-`ahanhormoz_demo` URLs) |
| `yarn db:studio` | Prisma Studio GUI |
| `yarn db:reset` | **Destructive** reset + migrate |

---

## Database

| Database | Purpose |
|----------|---------|
| `ahanhormoz_demo` | **This repo only** |
| `ahanhormoz` | Original client app — never seed from here |

### Env

```bash
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/ahanhormoz_demo?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="long-random-string"
```

- Keep secrets in `.env` / `.env.local` (gitignored).
- Prisma CLI loads **`.env`** by default; the app also loads `.env.local`.

### Schema (tour)

- **Category** → **Product** → optional **Manufacturer**
- **`Category.icon`**: icomoon CSS class (e.g. `icon-rebar`), **not emoji** — see `styles/icomoon.css` and `config/category-icons.ts`
- Product technical details: **`specs` JSON** (no sparse type-specific columns)
- **PriceDirection**: `UP` | `DOWN` | `STABLE` + **PriceHistory**
- Auth: User / Account / Session (NextAuth)
- Leads: ContactForm and QuickOrder (the contact and quote forms)

### Local Postgres (no Docker)

1. Install PostgreSQL and ensure the service is running.
2. Create DB: `CREATE DATABASE ahanhormoz_demo;`
3. Put the connection string in `.env` and `.env.local`.
4. `yarn prisma migrate deploy` then `yarn db:seed`.

### Common DB errors

| Error | Fix |
|-------|-----|
| `P1001` Can't reach server | Start PostgreSQL |
| `P1003` Database does not exist | `CREATE DATABASE ahanhormoz_demo` |
| Auth failed | Check user/password in `DATABASE_URL` |
| Seed refuses to run | URL must contain `ahanhormoz_demo` |

### Optional Docker

`docker-compose.yml` can run Postgres if you prefer containers. Prefer dedicated demo DB name in the compose config if you use it. Default project path is local Postgres.

---

## Icons (icomoon)

Do **not** store system emoji in the DB.

- Font + classes: `styles/icomoon.css`, `public/fonts/icomoon.ttf`
- Category map: `config/category-icons.ts` (`resolveCategoryIcon()`)
- Usage:

```tsx
<i className={`${category.icon} text-2xl`} aria-hidden />
// e.g. icon-rebar, icon-girder, icon-sheet, icon-pipe
```

| Category slug | Icon class |
|---------------|------------|
| rebar | `icon-rebar` |
| beam | `icon-girder` |
| sheet | `icon-sheet` |
| profile | `icon-profile` |
| angle | `icon-Corners` |
| pipe | `icon-pipe` |
| wire | `icon-Wire-products` |
| mesh | `icon-grating` |
| billet | `icon-bullion` |
| tube | `icon-profil` |

---

## Admin panel

### Features

- Login with role-based access (`ADMIN`, `SUPER_ADMIN`)
- Dashboard stats
- Products (list, filters, bulk ops where implemented)
- Categories, manufacturers, orders
- User management for super admin
- Admin action logging

### Routes

| Path | Purpose |
|------|---------|
| `/admin/login` | Sign in |
| `/admin/dashboard` | Overview |
| `/admin/products` | Catalog management |
| `/admin/categories` | Categories |
| `/admin/manufacturers` | Manufacturers |
| `/admin/orders` | Orders |
| `/admin/users` | Users (super admin) |
| `/admin/settings` | Settings |

### Security notes

- Passwords hashed with bcrypt
- NextAuth JWT sessions
- Admin APIs require authentication
- Prefer changing demo passwords before any public deploy

---

## Public app routes

| Path | Purpose |
|------|---------|
| `/` | Home |
| `/products` | Category index |
| `/products/[categorySlug]` | Category products |
| `/about`, `/contact` | Static pages |
| `/weight/[type]` | Weight calculators |

---

## API overview

Pages read with Prisma on the server and write through Server Actions, so only a
few route handlers remain:

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/products/export` | Excel export (auth) |
| POST | `/api/products/import` | Excel import (auth) |
| GET | `/api/admin/notifications` | Admin bell poll (auth) |
| GET/POST | `/api/orders` | Legacy order endpoints (no auth yet) |
| * | `/api/auth/[...nextauth]` | NextAuth |

---

## Project layout (high level)

```
app/           # App Router pages + API routes
components/    # UI (public + admin)
config/        # site, fonts, category-icons
lib/           # prisma, auth, price-updater, DTOs
prisma/        # schema.prisma, seed.ts
styles/        # globals + icomoon
types/         # shared TS types + PRODUCT_CATEGORIES
```

---

## Portfolio notes

- English UI + LTR for Germany-facing demos
- Keep client production data out of this repo’s DB
- Prefer shipping a polished public catalog + admin over feature parity with the original Persian product
