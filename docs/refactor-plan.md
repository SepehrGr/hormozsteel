# Refactor plan: progress tracker

This is the living checklist for the codebase refactor and the database walkthrough. Tick a
box (`- [x]`) in the same commit that finishes the step. To resume in a new session, read
this file, then `git log --oneline main..HEAD` on the current branch.

Each phase has its own branch, made from a freshly pulled `main`, and ends in a PR
(Phase 0 and 1.1: PRs #1–#2 from `refactor/codebase`; the rest of Phase 1: PR #3 from
`refactor/admin-categories`). Work goes step by step, one commit per step, with an
explanation after each.

## Decisions

- **Data layer** (revised 2026-10-07, after Phase 1):
  - **Reads:** server components with Prisma, by default.
    - Queries used in more than one place live in `lib/data/*`.
    - Client components receive DTOs or `select`ed columns, never raw rows.
  - **Writes from our own UI:** Server Actions + `revalidatePath`.
  - **Route handlers** only where the browser has to call the server by itself, or
    something outside the app does:
    - NextAuth;
    - the notification poll;
    - Excel import/export;
    - the public form POSTs (these could become public actions).
  - **SWR** only for polling.
  - *Originally* "SWR for the public catalog's filters; the public `/api` routes stay".
    Phase 1 showed server reads make those redundant. The catalog already renders on the
    server, then downloads every product again through the API.
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
  `slugify()` (moved to `lib/slug.ts` in 1.5)
- [x] 1.2 Lock the open door: `POST`/`PATCH`/`DELETE` in `app/api/categories/**` have no
  auth check today; add `requireApiAuth()` (the `[id]` page still calls them until Phase 6)
- [x] 1.3 `app/admin/categories/actions.ts`: create, update, delete (delete refuses while products are linked)
- [x] 1.4 Server `page.tsx` (read-only): Prisma read + `?q=` search, header, stats, table.
  The table is a client island for expand/collapse only. Search was broken before
  (`GET /api/categories` ignores `search`).
- [x] 1.5 `category-form-dialog.tsx` (RHF + `zodResolver` raw mode + `useFieldArray`)
  and the "Add category" button. `isValidSlug`/`slugify` moved to Prisma-free `lib/slug.ts`
  so client code can import the schema.
- [x] 1.6 Edit: per-row Edit button opening the same dialog with the row's values; the dialog takes `mode` (create | edit) instead of four label props
- [x] 1.7 Delete: per-row Delete button + `ConfirmDialog` (Delete greyed out while the
  category has products; the action refuses too). "Test Family" test row deleted.
- [x] 1.8 Write-up in `docs/admin-pages.md`: the server/client boundary, client islands,
  Server Actions, `revalidatePath`, and the checklist for Phases 2–6

## Phases 2–6: Apply the template

Each phase follows `docs/admin-pages.md`:

- Work on its own branch, made from a freshly pulled `main`.
- Make one commit per step, and explain each step.
- Test each step in the browser. The phase ends in a PR.

Steps marked *(from 8.0)* lock down API routes that are open today. That's the part of
8.0 each phase covers.

### Phase 2: Manufacturers (`refactor/admin-manufacturers`)

**Current code:**
- `page.tsx` is a 786-line client component with 13 `useState`s and 4 raw `fetch`es,
  and it updates with `PUT`.
- `[id]/page.tsx` (346 lines) isn't linked from anywhere and still has Persian toasts.

**Data facts:**
- `name` and `slug` are both unique.
- Deleting a manufacturer sets `manufacturerId = null` on its products (`SetNull`).
- Public pages that read manufacturers: `/manufacturers`, `/manufacturers/[postId]`, and
  the product pages (the mill name comes through `toProductDTO`).

- [x] 2.1 `lib/schemas/manufacturer.ts` (`logo` left out: no form ever edited it):
  - `name` required.
  - `slug` derived with `slugify` when empty.
  - `description`, `address`, `phone`.
  - `email` (validated as an email); `website` and `logo` (validated as URLs).
  - Blank fields become `null`. Import nothing server-only.
- [x] 2.2 `app/admin/manufacturers/actions.ts`: create, update, delete. Also fixes
  `/manufacturers` never refreshing: it's built once (`○`, no `revalidate`).
  - Revalidate `/admin/manufacturers`, `/admin/products`, and the public `/manufacturers`
    and `/products` layouts.
  - Delete is allowed. Its dialog states how many products will lose their mill.
- [x] 2.3 Server `page.tsx`: Prisma `select` plus `_count.products`; `?q=` search over
  name, slug and email.
  - Stats: mills, with contact (website, email or phone), products linked. This fixes the
    duplicated "Total"/"Listed" tile.
  - `sum` and `matchesSearch` moved to `lib/utils.ts`, shared with the categories page.
- [x] 2.4 Form dialog (`mode` create/edit) and the Add button. Shared now in
  `components/ui/`:
  - `formModeCopy` (dialog wording) and `invalidProps` (error wiring);
  - `DialogButton`, one Add button for every page, with the dialog as its child;
  - `DialogScope`/`useCloseDialog()`, so every dialog closes the same way.

  The per-entity `AddCategoryButton`/`AddManufacturerButton` are gone, and form
  dialogs take `action` instead of `onSubmit`.
- [x] 2.5 Edit, from a row button. The table became `'use client'` for its `editing`
  state; `toFormValues` turns the row's `null`s into the form's empty strings.
- [x] 2.6 Delete, through `ConfirmDialog` with the "N products will lose their mill"
  warning. Unlike categories it's never blocked: `onDelete: SetNull` keeps the products.
  Both tables now share one `DeleteDialog` in `components/ui/`; `capitalize` moved
  to `lib/format.ts`.
- [x] 2.7 Cleanup:
  - Delete the orphaned `[id]/page.tsx`.
  - Then delete `POST`/`PUT`/`DELETE` in `app/api/manufacturers/**` once a grep finds no
    callers *(from 8.0)*. The `[id]` page was their only caller.
  - Keep `GET`, which the admin products page uses. `GET /api/manufacturers/[id]` has no
    callers left except the unused `useManufacturer` hook; 7.8 deletes it.
- [x] 2.8 Review against categories. Move anything now written twice and identical into
  `components/admin/`. Likely candidate: the edit and delete row buttons.
  - [x] Tables: `components/admin/admin-table.tsx` has `AdminTable`, `rowClass`, `NameCell`
    and `RowActions`. The dashboard's recent-orders table uses it too; the orders inbox
    picks it up in Phase 4.
  - [x] Form dialogs: `hooks/use-action-form.ts` does the useForm → action → toast →
    close wiring and gives each control its id and error props (`field('name')`).
    `FormDialog` takes `mode` and `noun` and works out its own wording.
  - Left separate on purpose: the two `actions.ts` files (each refreshes different
    pages and has different delete rules) and the page layouts (the stats differ).

### Phase 3: Admin users (`refactor/admin-users`)

**Current code:** an 894-line client component with 13 `useState`s, SWR, and 5 raw
`fetch`es. It has inline role and active toggles (`quickPatch`).

**Rules the API enforces today, which must survive:**
- You can't deactivate or delete your own account.
- You can't deactivate, demote, or delete the last super admin.

**Access gap:** the sidebar hides the page from non-super admins, but `layout.tsx` only
calls `requireAuth`. Typing the URL opens it, although the API refuses the data.

- [x] 3.1 `lib/schemas/user.ts`:
  - Create: name, email, password, role.
  - Update: name, email, role, `isActive`, plus an optional new password.
  - Export one `passwordSchema` (length rules) for Phase 6 to reuse.
- [x] 3.2 `app/admin/users/actions.ts`, every action wrapped with `{ superAdmin: true }`:
  - Port each self and last-super-admin guard as an `ActionError`.
  - Hash with bcrypt.
  - Never `select` the password hash.
- [x] 3.3 Server page with `requireSuperAdmin()`, so regular admins are redirected.
  - Search with `?q=` (name, email) and filter with `?role=`.
  - Show last login and lockout state (`lockedUntil`).
- [x] 3.4 Form dialog and the Add button. The password field is required on create and
  becomes an optional "set new password" on edit.
- [x] 3.5 Edit.
- [x] ~~3.6 Role and active toggles as actions with `useOptimistic`.~~ Dropped (the user's
  call): role and status change in the edit dialog, and the pills stay display-only.
- [x] 3.7 Delete, through the shared `DeleteDialog`. Your own row gets no delete button.
  No greyed-out "last super admin" state: the only active super admin is always the
  viewer, whose row already has none. The server guard (3.2) still refuses it.
- [x] 3.8 Unlock, for accounts locked by failed logins: `unlockUser` clears
  `failedLoginAttempts` and `lockedUntil`. The row's lock-open button shows only while
  the lock is still running, with no confirm step. `RowActions` takes extra buttons as
  `children`. `scripts/unlock-account.ts` stays for when no super admin can sign in.
- [x] 3.9 Delete `app/api/admin/users/**`. A grep found no callers; the old page was the
  only one. (Not an 8.0 item: these handlers always checked for a super admin.) Every check it made lives on in `lib/schemas/user.ts` (name, email,
  password length, role) or `actions.ts` (self and last-super-admin guards; a taken email
  is Prisma's P2002).
- [x] 3.10 Stale sessions: the JWT keeps the role from login for up to 6 hours, so a
  demoted, deactivated, or deleted admin keeps their old access. In the `jwt` callback
  (`lib/auth.ts`), re-read `role`/`isActive` on every request after sign-in and throw
  when the account is gone or inactive; next-auth 4.24 then returns no session, so
  `requireAuth()` redirects to login. The middleware only decodes the token (no
  callback, no DB on the edge), so the page-level check is what enforces it.
  - Throw, don't return `null`: a `null` token still yields a session, just without
    `id` and `role`.
  - Name and email still come from the login-time token (next-auth builds them from
    the decoded cookie), so a rename shows after the next sign-in.
- [x] 3.11 Deleting an admin deletes their audit trail (`AdminLog` is
  `onDelete: Cascade`). Make `userId` nullable with `onDelete: SetNull`.
  - Migration `20261009184608_admin_log_keep_on_user_delete`: generated from the old
    schema, checked against the live DB (same SQL, no drift), and applied with
    `db execute`. Afterwards live DB → schema diffs empty.
  - Kept rows lose their author (`userId` becomes null). The delete dialog now says so
    and points to deactivating instead.
  - Nothing reads a log's author yet, so there was no "Deleted user" label to add. The
    first log viewer should show one for `userId: null`.
- [x] 3.12 Keep "who" after a delete: `AdminLog.userName` and `userEmail`, copied from
  the author when `logAdminAction` writes the row (read from the DB, since the session's
  name/email are from sign-in). They record the name as it was at the time, so later
  renames don't rewrite history.
  - Migration `20261009190137_admin_log_author_snapshot`, edited by hand: add the
    columns nullable, backfill the existing rows from `users`, then `SET NOT NULL`.
  - The delete dialog's warning is gone; deleting no longer loses anything.
  - A log viewer shows `userName`, plus "(deleted)" when `userId` is null.
  - The demo DB was built with `db push`, so none of the migrations are recorded as applied
    and `migrate dev` would want to **reset** it. Write the migration with
    `migrate diff --from-schema-datamodel <old> --to-schema-datamodel prisma/schema.prisma`
    and apply only that SQL with `prisma db execute`. W0 baselines the history later.
  - Show "Deleted user" wherever a log's author is read.

### Fix: change and audit row commit together (`fix/atomic-audit`)

Found in the Phase 3 click-through. Every action saves its change, then writes the
`AdminLog` row separately. If the log write fails, the change stays saved, the UI says
"Something went wrong", and a retry fails with a confusing error (e.g. "email already
taken"). The change also has no audit entry. Do this on its own branch from a fresh
`main`, after Phase 3 merges.

- [x] F.1 `logAdminAction` takes an optional client (`db = prisma`), so it can write
  inside a transaction; the author lookup uses the same client.
- [x] F.2 `adminAction` runs the handler inside `prisma.$transaction(async tx => …)`.
  The context gains `tx`, and `audit` writes through it. Both commit, or neither does.
  - `revalidatePath` inside the transaction is harmless: it only marks pages stale, so
    a rollback costs at most one extra re-render.
  - Interactive transactions time out after 5 s by default. Hash passwords (bcrypt,
    ~250 ms) before the first write so the transaction stays short.
- [x] F.3 Switch the three `actions.ts` files from `prisma.` to `tx.` (13 calls),
  including the users guards (`findUser`, `isLastSuperAdmin`, which now take `tx`).
  - Not using `isolationLevel: 'Serializable'` for now. The `isLastSuperAdmin` race
    needs two super admins demoting each other in the same instant, and Serializable
    would add retry handling to every action. The `ponytail:` note names the upgrade.
- [x] F.4 Test: make the audit throw on purpose. The change must not be saved and the
  error must show. Then check the normal path still saves both rows.
  - A temporary throw in `logAdminAction` (only for details containing `F4-FAIL`):
    creating "F4-FAIL Mill" showed the error and left no manufacturer and no log row.
    The throw was then removed (`git diff` clean).
  - Normal path: creating and deleting "F4 OK Mill" both succeeded, with CREATE and
    DELETE log rows signed by the admin.

Not covered: the route handlers that call `logAdminAction` directly (categories,
products bulk/import, quick-orders). Phases 4–6 delete most of them. Excel import stays
a route, so Phase 5 gives it the same transaction.

### Phase 4: Orders inbox (`refactor/admin-orders`)

**Current code:**
- A 907-line client component with 10 `useState`s, 7 raw `fetch`es, and two tabs: quick
  orders and contact messages.
- `window.confirm` handles deletes.
- `StatusPill` takes a plain `string`.

**Data facts:**
- `QuickOrderStatus` is `PENDING|CONFIRMED|PROCESSING|COMPLETED|CANCELLED`.
- `ContactFormStatus` is `NEW|READ|REPLIED`.
- `ContactForm` has unused `reply`/`repliedAt`/`repliedBy` columns.

- [x] 4.1 `config/order-status.ts`: a label and tone for each status, typed as
  `Record<QuickOrderStatus | ContactFormStatus, …>`, so a new enum value fails the
  typecheck until it gets a label. Move `StatusPill` into `components/admin/`.
- [ ] 4.2 `app/admin/orders/actions.ts`:
  - `updateQuickOrderStatus` (validated with `z.enum(QuickOrderStatus)`), `deleteQuickOrder`
  - `markContactRead`, `markContactReplied`, `deleteContactMessage`
- [ ] 4.3 Server page:
  - `?tab=quick|contact` in the URL, with the tabs as links.
  - `?status=` filter and `?q=` search.
  - Stats per tab: new, pending.
- [ ] 4.4 Quick orders table: a status `<select>` that saves through the action with
  `useOptimistic`; delete through `ConfirmDialog`, replacing `window.confirm`.
- [ ] 4.5 Contact messages table: expand a row to read the full message (same pattern as
  category sub-lines); buttons for mark read and mark replied; delete.
- [ ] 4.6 Notification bell: `components/admin/admin-header.tsx` polls
  `/api/contact?status=new` and `/api/quick-orders?status=pending` every 30 s with raw
  `fetch` + `setInterval`. Replace it with one SWR hook (`refreshInterval: 30_000`) on a
  single auth-guarded `/api/admin/notifications` route. Polling is a genuinely
  browser-driven read, so it keeps an API route rather than becoming a Server Action.
  Refresh the bell after the inbox actions too.
- [ ] 4.7 Lock down and clean up:
  - `/api/contact` `GET`/`PATCH`/`DELETE` are public today and expose customer messages
    *(from 8.0)*. Delete them once 4.6 has moved the bell off them.
  - Delete the admin `GET`/`PATCH`/`DELETE` in `/api/quick-orders` once unused.
  - Keep the public `POST`s, which the contact page and the order-request modal use.

### Phase 5: Products (`refactor/admin-products`), the largest

**Current code:**
- `page.tsx` is 464 lines with 14 `useState`s and 5 `useDisclosure`s.
- `components/admin/products/modals.tsx` is 850 lines with 5 dialogs. `AddProductModal`
  and `EditProductModal` repeat the same form.
- Filters drive SWR `useProducts` from the browser.
- Writes go through `hooks/use-product-mutations.ts` to `/api/products/**`, whose
  `PATCH`/`PUT`/`DELETE` have no auth.
- Excel import and export live in `hooks/use-product-excel.ts`, with 39 Persian strings.

**Bug: sorting only reorders the 10 rows on the current page**, in the browser, so "sort
by price" doesn't give the cheapest products overall.

**Data facts:**
- Price changes must go through `lib/price-updater.ts` so `PriceHistory` and
  `priceDirection` stay consistent.
- Slugs come from `generateUniqueSlug`.

- [ ] 5.1 `lib/schemas/product.ts`, built from `ProductFormData`:
  - name, brand, `manufacturerId`, size, price, `inStock`, `categoryId`, subcategory,
    weight.
  - The server also checks that the subcategory belongs to the chosen category.
- [ ] 5.2 `app/admin/products/actions.ts`:
  - create, update, delete;
  - `updatePrice`, through `price-updater`;
  - `toggleStock`, `bulkUpdate`, `bulkDelete`.
  - Revalidate `/admin/products`, `/admin/dashboard`, and the public `/products` layout.
- [ ] 5.3 Server page with every filter in the URL: `?q`, `?category`, `?stock`, `?page`,
  `?limit`, `?sort`, `?dir`.
  - Prisma does the `where`, `orderBy`, `skip` and `take`. This fixes the sort bug and
    removes SWR from this page.
  - `filters.tsx` becomes inputs inside `SearchToolbar`; `pagination.tsx` renders links.
- [ ] 5.4 The table island:
  - checkbox selection;
  - column sorting as links;
  - inline price edit and stock toggle with `useOptimistic`.
- [ ] 5.5 One `ProductFormDialog` for add and edit:
  - the category select drives the sub-line options (`useWatch`);
  - a manufacturer select.
  - Delete the Add and Edit modals.
- [ ] 5.6 Single delete, through `ConfirmDialog`. Note in the dialog that order history
  for the product is deleted too (cascade; fixed properly in DB track W3).
- [ ] 5.7 Bulk update and bulk delete dialogs on the actions. Delete
  `use-product-mutations.ts` and what's left of `modals.tsx`.
- [ ] 5.8 Excel:
  - Keep `/api/products/import`, because a file upload suits a route handler.
  - Export reuses the public `/api/products` GET today. Give it its own auth-guarded
    `/api/products/export` route that applies the current URL filters, so 7.8 can delete
    the public GET.
  - Translate the Persian strings.
  - Check that both routes require auth.
- [ ] 5.9 Cleanup:
  - Delete `/api/products` `POST`, `/api/products/[id]` `PATCH`/`PUT`/`DELETE`, and
    `/api/products/bulk` once unused *(from 8.0)*. Public `GET`s stay.
  - Delete the dead mutation hooks in `hooks/use-api.ts`: `useCreateProduct`,
    `useUpdateProduct` and `useDeleteProduct` have no callers.

### Phase 6: Settings, login, leftovers (`refactor/admin-settings`)

- [ ] 6.1 Settings, which today is a 352-line client page with 7 `useState`s and per-field
  edit toggles:
  - A server page reads the profile with Prisma.
  - One RHF + zod form, reusing `passwordSchema` from 3.1.
  - The `updateProfile` action.
  - **Require the current password to change the email or password.** Today
    `/api/admin/profile` doesn't, so a stolen session could lock the owner out.
- [ ] 6.2 After an email or password change, sign out, or refresh the session, so the
  JWT doesn't keep the old email.
- [ ] 6.3 Login, 433 lines with 8 `useState`s:
  - The form moves to RHF + zod.
  - It stays a client component, because NextAuth's `signIn` runs in the browser.
  - Move the lockout and rate-limit error messages into a pure function in `lib/`, and
    split out the visual side panel.
- [ ] 6.4 Delete the orphaned `app/admin/categories/[id]/page.tsx` (363 lines, unlinked,
  34 Persian strings). Then delete `POST`/`PATCH`/`DELETE` in `app/api/categories/**`,
  which no longer have callers. `GET` stays for the public pages.
- [ ] 6.5 Dashboard (already a server page): swap its hand-written stats and cards for
  `StatsBoard`/`DataCard` where they repeat.
- [ ] 6.6 Delete `/api/admin/profile` once unused. Fix the `requireAuth` vs
  `requireSuperAdmin` placement in layouts, if any remain.

## Phase 7: Public side

- [ ] 7.0 `lib/data/`: data-access functions for the public reads that more than one
  place needs:
  - `getCategories()`, `getCategoryProducts(slug)`, `getProduct(slug)`;
  - `getManufacturers()`, `getLatestPrices()`.
  - Each returns DTOs (`toProductDTO`) and starts with `import 'server-only'`. Next ships
    a copy of that package; check the build accepts it before running
    `yarn add server-only`.
  - Admin pages keep their one-off queries inline and move them here only if reused.
- [ ] 7.1 `order-request-modal.tsx` and `weight-calculator-modal.tsx`: untangle the effects
  and move the forms to RHF + zod.
- [ ] 7.2 Catalog pages:
  - `app/products/[categorySlug]/**` already query Prisma on the server (cached for an
    hour). Then `category-products.tsx` and `product-page.tsx` download the whole
    category again in the browser (`useProducts({ limit: 1000 })`, `useCategories()`).
  - Pass the data down as props from 7.0's functions instead, and keep the filtering as
    in-memory state in the client island.
  - Drop `useProducts`/`useCategories`.
  - Then split the two components (513 and 302 lines) into sections.
- [ ] 7.3 `product-slider.tsx` (`/api/latest-prices`) and `moment-news/page.tsx`
  (`/api/moment-news`): fetch on the server and pass the data down as props.
- [ ] 7.4 `contact/page.tsx`: RHF + zod. Optionally switch it, and the order-request
  modal, from the API POST to a public Server Action. That would be rate-limited and
  zod-validated like `adminAction`, but without the login check.
- [ ] 7.5 `about/page.tsx` and `manufacturers/[postId]`: move content into `config/` and
  split the sections.
- [ ] 7.6 Calculators: pure formulas in `lib/weight.ts`, with one `tsx --test` check. Also drop the
  `formatPrice` prop; every caller passes `formatUsd`.
- [ ] 7.7 Sweep out the Persian, RTL and `dir='ltr'` leftovers (including the `shamsh` and
  `qooti` keys in `config/category-icons.ts`, shown as icon names in the category form).
- [ ] 7.8 Delete the public GET routes that 7.2–7.3 leave without callers (grep first):
  - `/api/products`, `/api/products/[id]`
  - `/api/categories`, `/api/categories/[id]`
  - `/api/manufacturers`, `/api/manufacturers/[id]`
  - `/api/latest-prices`, `/api/moment-news`

  Excel export must already have its own route by now (5.8).

## Phase 8: API and hooks cleanup

By now `app/api/` should hold only:
- NextAuth;
- the notifications poll (4.6);
- Excel import/export (5.8);
- the two public form POSTs, unless 7.4 turned them into actions.

So most of this phase is checking that the remaining routes are complete.

- [ ] 8.0 **Security, do early.** These admin handlers have no auth check (found in 1.2;
  `middleware.ts` only guards `/admin` pages, not `/api`):
  - `products` POST, `products/[id]` PATCH/PUT/DELETE
  - ~~`manufacturers` POST, `manufacturers/[id]` PUT/DELETE~~ deleted in 2.7
  - `contact` GET (lists customer messages), PATCH, DELETE
  - `orders` GET (lists orders) and POST

  Public on purpose: `contact` POST, `quick-orders` POST, `auth/[...nextauth]`.

  Phases 2, 4 and 5 eventually delete most of these handlers (see the *(from 8.0)*
  steps). Until then they stay open. The quick fix is one `requireApiAuth()` guard per
  handler, on a `fix/api-auth` branch before Phase 2. Nothing calls `/api/orders` at all
  (only the unused `useOrders`/`useCreateOrder` hooks reference it), so that route and
  both hooks can simply be deleted.
- [ ] 8.1 Inventory `app/api/`: every remaining route needs one of the reasons above.
  Delete anything without a caller.
- [ ] 8.2 Every remaining route:
  - validates with zod, using the shared `lib/schemas/*`;
  - starts with the rate-limit guard;
  - uses `requireApiAuth()` unless it's public on purpose.
- [ ] 8.3 Delete `hooks/use-api.ts`. The bell's SWR hook (4.6) lives in its own file;
  every other hook in it has been replaced by server reads or actions.
- [ ] 8.4 Rewrite CLAUDE.md for the final model:
  - the data-access table (server read / action / route);
  - the API-route conventions, which now cover a handful of routes;
  - the React 18 → 19 and `ES2017` → `es6` target facts.

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
