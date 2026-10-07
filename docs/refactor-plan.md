# Refactor plan: progress tracker

This is the living checklist for the codebase refactor and the database walkthrough. Tick a
box (`- [x]`) in the same commit that finishes the step. To resume in a new session, read
this file, then `git log refactor/codebase`.

Branch: `refactor/codebase`. Work goes phase by phase, with a review pause after each one.

## Decisions

- **Hybrid data layer.**
  - Server components read with Prisma.
  - Admin mutations are Server Actions + `revalidatePath`.
  - SWR is used only where the browser drives the data (the public catalog's filters).
  - The public `/api` routes stay.
- **zod + react-hook-form.** There is one zod schema per entity in `lib/schemas/`, shared by
  the form and the server.
- `app/admin/dashboard/page.tsx` is already a server component that reads with Prisma, so it
  is the model for admin reads.

---

## Phase 0: Foundations (no visible change)

- [x] 0.1 React 19: `react`, `react-dom`, `@types/react`, `@types/react-dom`. Check peer
  dependencies (`react-leaflet`, HeroUI, framer-motion).
- [x] 0.2 Add `zod`, `react-hook-form`, `@hookform/resolvers`. Remove the unused
  `@auth/prisma-adapter`.
- [x] 0.3 `lib/format.ts`: `formatUsd`, `formatDate`, `formatDateTime`, `pluralize`.
  Replace the duplicate copies.
- [x] 0.4 UI primitives:
  - Give the cva `components/ui/button.tsx` the admin variants.
  - Move the shared field and label classes and a `FormField` into `components/ui/`.
- [x] 0.5 Shared admin components in `components/admin/`: `PageHeader`, `StatsBoard`,
  `SearchToolbar` (URL `?q=` via `next/form`), `EmptyState`, `DataCard`. Dialogs in
  `components/ui/dialogs.tsx`: `FormDialog`, `ConfirmDialog`.
- [x] 0.6 Server Action plumbing:
  - `lib/actions.ts`: `ActionResult`, `ActionError`, and `adminAction()`, which runs
    auth → API rate limit (`checkApiRateLimit`, not the 5-try login limiter) → zod →
    handler. The handler gets `ctx.audit()` for AdminLog. Prisma P2002/P2003/P2025 errors
    become readable messages.
  - `lib/action-toast.ts`: `toastResult()`, a plain function rather than a hook. Pending
    state comes from RHF `isSubmitting` or `useTransition`.

## Phase 1: Pilot, `app/admin/categories` (the template)

Small steps, one commit each, with an explanation after every step.

- [x] 1.1 `lib/schemas/category.ts`: one zod schema for the form and the actions;
  `slugify()` in `lib/slug-generator.ts`
- [x] 1.2 Lock the open door: `POST`/`PATCH`/`DELETE` in `app/api/categories/**` have no
  auth check today; add `requireApiAuth()` (the `[id]` page still calls them until Phase 6)
- [x] 1.3 `app/admin/categories/actions.ts`: create, update, delete (delete refuses while products are linked)
- [ ] 1.4 Server `page.tsx` (read-only): Prisma read + `?q=` search, header, stats, table.
  The table is a client island for expand/collapse only. Search was broken before
  (`GET /api/categories` ignores `search`).
- [ ] 1.5 `category-form.tsx`: RHF + `zodResolver` + `useFieldArray` for sub-lines
- [ ] 1.6 Add and Edit dialogs wired to the actions
- [ ] 1.7 Delete dialog wired to the action
- [ ] 1.8 Write-up: the server/client boundary, client islands, `revalidatePath`

## Phases 2–6: Apply the template

- [ ] 2 Manufacturers: list page + `[id]` (including its Persian leftovers)
- [ ] 3 Users: actions, `useOptimistic` for the quick toggles, `requireSuperAdmin`
- [ ] 4 Orders:
  - Store the active tab in the URL as `?tab=`.
  - Move the status label and colour map into `config/`.
  - Turn the status changes into actions.
- [ ] 5 Products: split `modals.tsx` and share one `ProductForm`; move the mutations onto
  actions; review `use-product-excel`.
- [ ] 6 Settings, login, categories `[id]`: forms on RHF + zod; the profile update becomes an
  action.

## Phase 7: Public side

- [ ] 7.1 `order-request-modal.tsx` and `weight-calculator-modal.tsx`: untangle the effects
  and move the forms to RHF + zod.
- [ ] 7.2 Split `product-page.tsx` and `category-products.tsx` into sections; type the SWR
  hooks.
- [ ] 7.3 `product-slider.tsx` and `moment-news/page.tsx`: fetch on the server instead of the
  client.
- [ ] 7.4 `contact/page.tsx`: RHF + zod.
- [ ] 7.5 `about/page.tsx` and `manufacturers/[postId]`: move content into `config/` and
  split the sections.
- [ ] 7.6 Calculators: pure formulas in `lib/weight.ts`, with one `tsx --test` check. Also drop the
  `formatPrice` prop; every caller passes `formatUsd`.
- [ ] 7.7 Sweep out the Persian, RTL and `dir='ltr'` leftovers.

## Phase 8: API and hooks cleanup

- [ ] 8.0 **Security, do early.** These admin handlers have no auth check (found in 1.2;
  `middleware.ts` only guards `/admin` pages, not `/api`):
  - `products` POST, `products/[id]` PATCH/PUT/DELETE
  - `manufacturers` POST, `manufacturers/[id]` PUT/DELETE
  - `contact` GET (lists customer messages), PATCH, DELETE
  - `orders` GET (lists orders)

  Public on purpose: `contact` POST, `orders` POST, `auth/[...nextauth]`.
- [ ] 8.1 Validate in the routes with zod, using the shared `lib/schemas/*`.
- [ ] 8.2 Add the missing rate-limit guard to `contact`, `orders`, `admin/profile`,
  `manufacturers/[id]`, `products/bulk`, `products/import`, `latest-prices`, `moment-news`.
- [ ] 8.3 `PUT` → `PATCH` in `products/[id]` and `manufacturers/[id]`.
- [ ] 8.4 `hooks/use-api.ts`: one `toQueryString`, DTO generics in place of `any`, and remove
  the hooks that are now dead.
- [ ] 8.5 Rewrite CLAUDE.md's data-access table for the hybrid model.

---

## DB track: guided walkthrough + optimisation (after the UI refactor)

Every module runs the same loop, then pauses for questions:

1. Explain what the models mean, the relations (as an ER diagram), and the fields.
2. Show the DDL with `prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`,
   and the runtime SQL from the query log.
3. Trace how the app reads and writes those tables.
4. Inspect the real rows in `ahanhormoz_demo`.
5. Optimise: `migrate dev --create-only`, read the SQL together, apply, then update the
   seed and DTOs.

Only ever touch `ahanhormoz_demo`.

- [ ] W0 Prisma fundamentals, then migration hygiene (drift check and baseline).
- [ ] W1 Catalog (Category, Manufacturer, Product):
  - money `Float` → `Decimal(12,2)`
  - Category→Product `Restrict`
  - subcategory model decision
  - index review with `EXPLAIN ANALYZE`
- [ ] W2 Pricing (PriceHistory, `price-updater`):
  - write the price copies on Product in one `$transaction`
  - drop the redundant indexes and the `changedAt`/`createdAt` duplicate
- [ ] W3 Orders and leads:
  - OrderItem and Order cascades → `Restrict`
  - `QuickOrder` types
  - drop the redundant `@db.Text`
- [ ] W4 Auth and audit: drop `Account`/`Session`/`VerificationToken` and
  `User.emailVerified/image`; review the AdminLog indexes.
- [ ] W5 Seed: update it for each schema change.
- [ ] W6 Query performance: query log, N+1s, `select` vs `include`, `EXPLAIN ANALYZE`.

## Verification (every phase)

- `yarn lint:check`, `yarn tsc --noEmit`, `yarn build`
- Click through the touched pages on the dev server (:3000).
- Commit each phase with conventional commits.
