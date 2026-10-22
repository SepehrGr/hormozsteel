# Hormoz Steel

A steel trading website with a public price catalog and an admin panel to run it.

Visitors browse steel products by category, see today's prices and which way
they moved, work out weights with built-in calculators, and send a quote request.
Staff sign in to manage the catalog, update prices in bulk from a spreadsheet,
answer orders and messages, and manage the team.

![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=nextdotjs)
![React](https://img.shields.io/badge/React_19-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2d3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169e1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_4-06b6d4?logo=tailwindcss&logoColor=white)

> A portfolio project: an English rebuild of a real client site, running on its
> own demo data.

![The public home page](docs/screenshots/home.png)

![The admin dashboard](docs/screenshots/admin.png)

## Features

### Public site

- **Price catalog**: categories → subcategories → product pages, with the
  current price, its direction (up, down or stable) and the last change.
- **Weight calculators** for rebar, beams, sheet, pipe, angle, channel, hollow
  section and billet.
- **Contact and quote forms**, validated on both sides and rate-limited.
- Light and dark themes, responsive down to phone width.

### Admin panel

- **Dashboard** with catalog and inbox stats.
- **Products**: search, filter, sort and paginate; create, edit and bulk
  delete; **Excel export and all-or-nothing import** for bulk price updates.
- **Price history**: every price change is recorded with its direction.
- **Categories and mills** (manufacturers); a category that still has products
  can't be deleted.
- **Inbox**: quote requests and contact messages with statuses, plus a
  notification bell that polls for new ones.
- **Users and roles** (`ADMIN`, `SUPER_ADMIN`), login lockout, and an
  **audit log** of every admin write.
- Tables collapse into accordion rows on phones; no horizontal scrolling.

## Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions), React 19 |
| Language | TypeScript (strict) |
| Data | PostgreSQL, Prisma 6 |
| Auth | NextAuth (credentials, JWT sessions), bcrypt |
| Forms and validation | react-hook-form, zod |
| UI | Tailwind CSS 4, HeroUI, Lucide icons, Leaflet map |
| Other | SWR (notification polling), SheetJS (Excel), node:test |

## How it's built

- **Reads happen on the server.** Pages are Server Components that query
  Prisma directly; public reads are cached per request.
- **Writes go through Server Actions.** Each one runs through a single wrapper:
  auth check → rate limit → zod validation → the change, all in **one database
  transaction together with its audit-log row**, so a write never lands without
  its record.
- **Typed results end to end.** Actions return a `{ success, data }` or
  `{ success: false, error, fieldErrors }` result that the forms map straight
  onto their fields.
- **Few API routes.** Only sign-in, the Excel download and the notification
  poll are route handlers; each one checks its own rate limit, auth and input.
- **Money is exact.** Prices are stored as `Decimal(12,2)`, and every price
  change goes through one function that writes the history row.
- **Shared admin building blocks.** Every admin page is put together from the
  same table, toolbar, dialog and form components. See
  [`docs/admin-pages.md`](docs/admin-pages.md) for the pattern.

## Project structure

```
.
├── app/
│   ├── page.tsx                  # Home
│   ├── products/                 # Catalog: /products/[categorySlug]/[productId]
│   ├── weight/[type]/            # Weight calculators
│   ├── about/, contact/
│   ├── actions.ts                # Public Server Actions (contact, quote)
│   ├── admin/
│   │   ├── login/
│   │   └── (panel)/              # Shared layout; each area has page.tsx + actions.ts
│   │       ├── dashboard/
│   │       ├── products/
│   │       ├── categories/
│   │       ├── manufacturers/
│   │       ├── orders/           # Inbox: quote requests and messages
│   │       ├── users/            # Super admin only
│   │       └── settings/
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── admin/notifications/  # Bell poll
│       └── products/export/      # .xlsx download
├── components/
│   ├── admin/                    # AdminTable, PageHeader, SearchToolbar, Pagination…
│   ├── ui/                       # FormDialog, ConfirmDialog, DeleteDialog, form fields
│   ├── products/, calculators/, home/, about/, content/
│   └── layout/                   # Navbar, footer, theme switch
├── lib/
│   ├── actions.ts                # adminAction / publicAction wrappers
│   ├── auth.ts                   # NextAuth config, password checks, lockout
│   ├── data/                     # Cached public reads
│   ├── schemas/                  # zod schemas, one per entity
│   ├── price-updater.ts          # The one place prices change
│   ├── rate-limit.ts
│   └── weight.ts (+ weight.test.ts)
├── hooks/                        # useActionForm, useNotifications, useProductExcel
├── config/                       # Site, calculators, category icons
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                   # ~78 demo products, demo admin accounts
├── middleware.ts                 # Guards /admin pages
└── styles/
```

## Getting started

**Requirements:** Node.js 22 (see `.nvmrc`), Yarn 1, PostgreSQL or Docker.

```bash
# 1. Install
yarn

# 2. Create a database (the seed only runs against this name)
createdb ahanhormoz_demo
#    or start one in Docker: docker compose up -d

# 3. Configure: create .env with
#    DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ahanhormoz_demo"
#    NEXTAUTH_URL="http://localhost:3000"
#    NEXTAUTH_SECRET="<output of: openssl rand -base64 32>"

# 4. Create the tables and load demo data
yarn prisma migrate deploy
yarn db:seed

# 5. Run
yarn dev
```

The site runs at http://localhost:3000 and the admin panel at `/admin/login`.
The seed creates an admin and a super admin account; their logins are in
[`prisma/seed.ts`](prisma/seed.ts).

## Scripts

| Command | What it does |
|---|---|
| `yarn dev` | Start the dev server (Turbopack) |
| `yarn build` / `yarn start` | Production build and server |
| `yarn lint:check` | ESLint, zero warnings allowed |
| `yarn tsc --noEmit` | Type-check |
| `yarn test` | Unit tests |
| `yarn db:migrate` | Create and apply a migration after a schema change |
| `yarn db:seed` | Load the demo catalog |
| `yarn db:studio` | Browse the database in Prisma Studio |
