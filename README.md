# Ahanhormoz Demo (English portfolio showcase)

English portfolio demo of a **B2B steel / metal pricing catalog** built with Next.js and Prisma.

This is a **portfolio-facing rebuild baseline** derived from a real client project. It is **not** the live production client site.

## Stack

- Next.js (App Router)
- TypeScript
- Prisma + PostgreSQL
- NextAuth.js
- HeroUI / Tailwind

## Status

Baseline import of the app source for redesign + English conversion. Design overhaul and full English UI are in progress.

## Setup

```bash
# install
yarn

# env
cp .env.example .env.local
# fill DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET

# database
yarn db:push   # or yarn db:migrate
yarn db:seed

# dev
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Role

Solo full-stack frontend: product catalog, pricing views, admin for products/categories/manufacturers, auth.

## License

See `LICENSE`.
