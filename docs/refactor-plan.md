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
- [x] 4.2 `app/admin/orders/actions.ts`:
  - `updateQuickOrderStatus` (validated with `z.enum(QuickOrderStatus)`), `deleteQuickOrder`
  - `updateContactStatus` (one action instead of mark read / mark replied; sets
    `repliedAt` on `REPLIED`), `deleteContactMessage`
- [x] 4.3 Server page:
  - `?tab=quick|contact` in the URL, with the tabs as links.
  - `?status=` filter and `?q=` search.
  - Stats per tab: new, pending.
- [x] 4.4 Quick orders table:
  - A status `<select>` that saves through the action with `useOptimistic`.
  - Delete through the shared `DeleteDialog`, replacing `window.confirm`.
  - Expand a row to see full specs, product and notes (replaces the old Eye modal).
    One shared `ExpandableRow` client component, which categories switch to as well.
- [x] 4.5 Contact messages table: expand a row (`ExpandableRow`) to read the full
  message; buttons for mark read and mark replied; delete.
- [x] 4.6 Notification bell: `components/admin/admin-header.tsx` polls
  `/api/contact?status=new` and `/api/quick-orders?status=pending` every 30 s with raw
  `fetch` + `setInterval`. Replace it with one SWR hook (`refreshInterval: 30_000`) on a
  single auth-guarded `/api/admin/notifications` route. Polling is a genuinely
  browser-driven read, so it keeps an API route rather than becoming a Server Action.
  Refresh the bell after the inbox actions too.
- [x] 4.7 Lock down and clean up:
  - `/api/contact` `GET`/`PATCH`/`DELETE` are public today and expose customer messages
    *(from 8.0)*. Delete them once 4.6 has moved the bell off them.
  - Delete the admin `GET`/`PATCH`/`DELETE` in `/api/quick-orders` once unused.
  - Keep the public `POST`s, which the contact page and the order-request modal use.
  - Found on the way: the public `POST`s now count on their own rate-limit counter
    (`checkSubmitRateLimitAndRespond`). The quote form's limit of 20 was checked against
    the counter every API call shares, so 20 catalog reads blocked a quote; the contact
    form had no limit at all. The admin writes in `/api/categories/**` and
    `/api/products/**` still pass custom limits to the shared counter; they go in 6.4
    and Phase 5.

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

- [x] 5.1 `lib/schemas/product.ts`, built from `ProductFormData`:
  - name, brand, `manufacturerId`, size, price, `inStock`, `categoryId`, subcategory,
    weight. Price and weight are strings in the form and numbers in the output
    (`weight` → `weightKg`). The mill is a picked `manufacturerId` or a typed `brand`.
  - The server also checks that the subcategory belongs to the chosen category. That
    needs the database, so it lives in the 5.2 actions, not the schema.
- [x] 5.2 `app/admin/products/actions.ts`:
  - `createProduct`, `updateProduct`;
  - `updateProducts({ ids, changes })` for price, stock and category. Inline price edit and
    the stock toggle send one id, so there's no separate `updatePrice`/`toggleStock`;
  - `deleteProducts({ ids })` for single and bulk delete.
  - Prices go through `setProductPrice(tx, …)`, split out of `price-updater`, which now
    skips unchanged prices instead of writing a STABLE history row.
    `generateUniqueSlug` and `resolveManufacturerId` take a `db` client, like `logAdminAction`.
  - Only a rename gets a new slug. Seeded slugs don't follow the name, so regenerating
    on every save would move product URLs.
  - The server checks that the sub-line belongs to the category. A bulk category change
    clears sub-lines the new category doesn't have.
  - Revalidate `/admin/products`, `/admin/dashboard`, and the public `/products` layout.
- [x] 5.3 Server page with every filter in the URL: `?q`, `?category`, `?stock`, `?page`,
  `?limit`, `?sort`, `?dir`.
  - Prisma does the `where`, `orderBy` (plus `id` as a tie-break), `skip` and `take`.
    This fixes the sort bug and removes SWR from this page.
  - `filters.tsx` became two selects inside `SearchToolbar`. Pagination is now the shared
    `components/admin/pagination.tsx` (`Pagination` links and `pageParams`), ready for the
    orders inbox.
  - Two client islands for now. `header-actions.tsx` has Add and Excel;
    `products-workspace.tsx` has selection, the bulk bar, and the edit/delete/bulk
    modals, on the old API hooks with `router.refresh()`. 5.4–5.8 take them apart.
    Sorting pushes `?sort&dir` with `router.push` for now.
- [x] 5.4 The table island, rebuilt on the shared `AdminTable` (dropped HeroUI `Table`):
  - checkbox selection with native checkboxes; select-all goes indeterminate when only some rows are selected;
  - column sorting as links (`?sort&dir`, page reset; a second click flips the order).
    `Column.sort` sets `aria-sort` on the header;
  - inline price edit (`PriceCell`) and stock toggle (`StockToggle`) call `updateProducts`
    with one id, through `useOptimistic`.
  - Found: Next rejects any sync function inside an exported `'use server'` value (the
    `.refine` arrow broke the whole dev server once a page imported the actions). The bulk
    changes schema moved to `lib/schemas/product.ts` as `productChangesSchema`.
- [x] 5.5 One `ProductFormDialog` for add and edit, on `useActionForm` + `FormDialog`:
  - the category select drives the sub-line options (`useWatch`); changing the category
    clears the sub-line;
  - a mill select whose blank option means "new mill" and shows a name input. This drops the
    old `'__custom__'` sentinel; the schema already reads `manufacturerId: ''` + `brand`.
  - Add is a `DialogButton` on the server page bound to `createProduct`. Edit opens through
    `DialogScope` in the workspace, bound to `updateProduct`.
  - Deleted the Add and Edit modals, `MillField`, `ProductFormData`/`emptyProductForm`/
    `toProductPayload`/`isFormValid`, and `createProduct`/`updateProduct` in
    `useProductMutations`. `header-actions.tsx` is now only Excel.
- [x] 5.6 Single delete, through the shared `DeleteDialog` (on `ConfirmDialog`) and
  `deleteProducts({ ids: [id] })`. The dialog notes that price history and order lines go
  too (cascade; fixed properly in DB track W3).
  - The old product modals put Delete first and left-aligned. The shared footer is Cancel
    then Delete, right-aligned, and the old bulk-delete modal got the same order until 5.7
    replaces it.
  - The workspace counts only selected ids still on the page, so a deleted row leaves the
    selection on its own.
  - Deleted `DeleteSingleModal` and `deleteProduct` in `useProductMutations`.
  - Delete buttons name their object: `DeleteDialog` passes "Yes, delete the {noun}" /
    "Deleting the {noun}…". `confirmLabel`/`pendingLabel` are required on `ConfirmDialog`, so no
    dialog falls back to a bare "Delete". The orders tables pass "Tom Becker's quote request" /
    "Emma Wright's message" as the name, so neither the question nor the row button reads as
    deleting the customer. (From an impeccable critique of the dialogs, 26/40.)
- [x] 5.7 Bulk update and bulk delete dialogs on the actions. Deleted
  `use-product-mutations.ts` and `modals.tsx` (the last of the HeroUI modals here).
  - Bulk delete is the shared `DeleteDialog` with a new `count` prop: title "Delete 3 products",
    button "Yes, delete 3 products" / "Deleting 3 products…", toast "3 products deleted", and the
    same history/order-lines warning. Its pending state stops a double-click from sending two
    requests (checked: one audit row).
  - Bulk edit is `BulkEditDialog` on `useActionForm` + `FormDialog`, which now takes an optional
    `submitLabel`/`pendingLabel`: "Apply to 3 products" / "Applying…". Price, stock and
    category each default to "Keep".
  - `productChangesSchema` takes the form's shape (`''` = keep, `stock: '' | 'in' | 'out'`) and
    outputs `undefined` for keep. The inline price and stock cells send the same shape.
  - After a bulk edit the rows stay selected; after a bulk delete they leave the selection on
    their own.
- [x] 5.8 Excel:
  - `lib/product-filters.ts` turns `?q/category/stock/sort/dir` into Prisma's `where` and
    `orderBy`. The page and the export both use it, so an export is exactly what the page shows
    (all pages).
  - `GET /api/products/export` (rate limit + `requireApiAuth`) builds the .xlsx on the server.
    Export is a plain `<a download>` link carrying the page's filters, so the public
    `/api/products` GET is no longer used by the admin (7.8 can delete it).
  - `lib/product-sheet.ts` holds the English column names. Export writes them and import reads
    them, so an exported file can be edited and imported back.
  - Import (`useProductExcel` + `ImportExcelButton`): no Persian strings left. Blank cells on an
    update keep the current value, and the errors name what's missing.
  - Fixed in `/api/products/import`:
    - it's rate-limited;
    - the Mill column now sets the mill (it was dropped), creating one if new;
    - only a rename gets a new slug (an import used to re-slug every row);
    - stock is a boolean.
  - Both routes return 401 when not logged in (checked).
  - Deleted `header-actions.tsx` and the unused `downloadTemplate`. Export's weight column was
    always blank (it read `product.weight`); it's now `weightKg`.
- [x] 5.9 Cleanup:
  - Deleted `/api/products` `POST`, `/api/products/[id]` `PATCH`/`PUT`/`DELETE`, and
    `/api/products/bulk` *(from 8.0)*. A grep found only the dead hooks calling them. The public
    `GET`s stay for the shop (7.8 decides).
  - Deleted the dead `useCreateProduct`, `useUpdateProduct` and `useDeleteProduct` in
    `hooks/use-api.ts`.
  - Removed `@heroui/table`, `@heroui/checkbox` and `@heroui/modal` from `package.json`; nothing
    imports them, and the Tailwind config only uses the theme package.
  - Phase-end checks: `yarn lint:check`, `yarn build`, `tsc`.

### Phase M: Admin on phones (`refactor/admin-mobile`)

Runs before Phase 6. On a phone the admin is unusable: `AdminShell` pads the content by the
sidebar's width at every screen size (`pl-60`), so a 390px screen leaves about 150px for the
page. Most of the fix lives in the shared pieces, so every page gets it at once. Settings, the
dashboard and login are skipped here, because Phase 6 rebuilds them and checks them at 390px.

- [x] M.0 Scope: `/impeccable adapt` on every admin page, measured at 390, 768, 1024, 1280
  and 1536px. Findings:
  - **The page scrolls sideways at every width**, not only on phones. `<main>` has fixed
    widths (`md:w-[900px] xl:w-[1100px] 2xl:w-[1400px]`) on top of the 240px sidebar padding:
    1024px renders 1141px wide, 1280 → 1340, 1536 → 1640.
  - Its column has no `min-w-0`, so on a phone it stretches to the widest table (products:
    994px) and `AdminTable`'s own `overflow-x-auto` never kicks in.
  - On a 390px phone the sidebar leaves `<main>` 162px.
  - With the shell fixed (simulated by hiding the sidebar), filters stack and dialogs fit.
    What's left: the tables; header action rows that wrap (products: "Add product" alone on
    a second line); `StatsBoard` leaving an empty cell for an odd count (dashboard 7,
    products 3); 32px icon buttons (header bell and theme, collapse, `RowActions`); 16px
    checkboxes; 10px table headers and sidebar labels.
  - Login already works at 390px.
- [x] M.1 Shell:
  - `<main>` becomes `w-full max-w-[1400px]` with `min-w-0` on its column, so nothing
    scrolls sideways at any width. `AdminTable`'s scroll box gets `relative`: without it the
    `sr-only` "Actions" heading (absolutely positioned) escaped it and kept products 893px wide.
  - Below `lg`, the sidebar becomes a drawer: the same `AdminSidebar` inside `ModalDialog`,
    opened from a menu button in the header. It closes on Esc, on a backdrop click, on
    navigation, and when the window widens to `lg`. The collapsed rail applies only from
    `lg` up.
  - The 10px labels in the sidebar and header go up to the 11px floor, and the header's
    icon buttons get 44px tap targets on touch.
- [x] M.2 Headers and toolbars:
  - `PageHeader` actions: below `sm` they share rows at equal width, and the primary stays
    last, so it's rightmost or alone at full width (the same rule as the M.4 footers). Products
    drops its extra wrapper `div` so its buttons are direct children.
  - `StatsBoard`: an odd last stat spans both columns, so there's no empty cell. Labels go
    up to 11px.
  - `SearchToolbar`: Search and Clear fill the row on phones.
  - `Pagination`: 44px cells on touch. Below `sm` the page numbers give way to
    "Page 3 of 8" between Previous and Next, because seven 44px cells don't fit in the card.
    The per-page links became a native `<select>` (`PageSizeSelect`, the user's call): phones
    open their own picker, and desktop browsers open it upward when there's no room below.
- [x] M.3 `AdminTable` as an accordion on narrow screens (the user's choice: never scroll a
  table sideways). As built:
  - `AdminTable` draws every row from `columns` (`cell`, `narrow: 'title' | 'summary'`,
    `narrowHeader`), plus `rows`, `rowLabel`, `detail` and `rowClassName` (the user's pick
    over a `data-label` on each hand-written cell). `actionsColumn()` is the shared last
    column.
  - A `narrow:` variant in `globals.css` (container queries: 45rem, or 60rem with `wide`)
    replaces the table min-widths. `AdminRow` replaces `ExpandableRow`.
  - The products select-all and sort links stay as a header bar on narrow screens.
  - Known duplicate: an open narrow quote request shows its specs in the field and again in
    the details panel.

  The plan, for reference:
  - The switch follows the table's own width through a container query (`@container`,
    built into Tailwind 4), not the viewport, so it holds with the sidebar open or closed.
  - It uses the same markup, restyled. No second mobile table (the public
    `product-table.tsx` renders two; don't copy that).
  - A closed row shows the name, one key value (price, status, role), and a chevron.
    Products keep the bulk checkbox on the left at 44px.
  - An open row shows the other cells as label and value pairs (labels from `columns`),
    then the row's actions as a full-width bar with text labels at 44px.
  - Rows that already expand (category sub-lines, order details) put that detail in the
    same body, so there's one toggle, not two. The order status select stays usable there.
  - Build it on `ExpandableRow`, which already holds the open state and the toggle.
- [x] M.4 Dialogs on phones, all in `DialogFrame` (`components/ui/dialogs.tsx`):
  - Below `sm` the footer buttons stack at full width and 44px, the action on top
    (`flex-col-reverse`, so the tab order stays Cancel then action). The user changed their
    earlier "two columns, no stacking" call.
  - `FormDialog` is a full-height sheet; `ConfirmDialog` is anchored to the bottom. Both slide
    up (`starting:translate-y-full`). The title bar and footer are `sticky` at every width, so
    long forms keep both in view.
  - The header does dim: the dialog is in the top layer, under one 50% backdrop. The M.0 note
    was a false alarm (dimmed dark icons on a dark page).
- [x] M.5 Page check: categories, manufacturers, users, orders and products, including the
  products bulk bar, filters and import/export. On every page the document is no wider than
  the viewport at 390, 768, 1024, 1280 and 1536px (40 of 40 page and width pairs). Fixed:
  - Products bulk bar: the count gets its own line, and the two buttons share the row at 44px.
    Then, at the user's request: below `sm` it's a dock pinned to the screen bottom (an
    "Unselect all" ✕ and the count, then equal-width Edit/Delete selected across the bar). From
    `sm` up it stays the bar above the table, sticky under the header.
  - 44px touch targets for the order status select, the products sort links, the inline price
    button and input, and the stock toggle.
  - Left for 6.5: the dashboard's "Manage products" and "View all" links (20px and 16px).

### Phase 6: Settings, login, leftovers (`refactor/admin-settings`)

- [x] 6.1 Settings, which today is a 352-line client page with 7 `useState`s and per-field
  edit toggles:
  - A server page reads the profile with Prisma.
  - One RHF + zod form, reusing `passwordSchema` from 3.1.
  - The `updateProfile` action looks the user up by `session.user.id`. Today the route
    uses the login-time JWT email, so after an email change the page 404s and saves 500.
  - **Require the current password to change the email or password.** Today
    `/api/admin/profile` doesn't, so a stolen session could lock the owner out.
  - Redesign, from the settings critique (18/40). The current per-field edit toggles go,
    and so does the focus bug they cause (`FieldRow` is declared inside the render):
    - `PageHeader` with no "Account" eyebrow, left-aligned like the other pages; only
      the form is capped at `max-w-2xl`.
    - One always-editable `<form>` built from `FormField`/`Input`/`invalidProps`: a
      Profile `DataCard` (name, and email with "You sign in with this") and a Password
      `DataCard` (new and confirm, rule shown up front, "Leave blank to keep current").
    - A "Confirm it's you" section (current password) appears only while the email or
      password is changed. It's checked with `bcrypt.compare`, the error shows on the field
      via `setError`, and a wrong password counts toward the lockout.
    - Discard and Save stay disabled until something changes, and Enter submits. Set
      `autocomplete` on every field (`name`, `email`, `current-password`, `new-password`).
    - Mobile: a single column with full-width buttons.
- [x] 6.2 After an email or password change, sign out, or refresh the session, so the
  JWT doesn't keep the old email.
  - Email or password change: sign out this session (other sessions keep their 6-hour JWT).
  - The `jwt` callback re-reads `name`/`email` with `role`/`isActive`; the `session`
    callback copies them, since next-auth builds `session.user` from the cookie as it was.
    A name change calls `useSession().update()`, so the header updates without a reload.
  - Fixed on the way: the NextAuth POST wrapper parsed every body as a form, so
    `update()` (JSON) got a 500; the `redirect` callback sent relative callback URLs to
    `/`, so Sign out never reached `/admin/login`.
- [x] 6.3 Login, 433 lines with 8 `useState`s:
  - The form moves to RHF + zod.
  - It stays a client component, because NextAuth's `signIn` runs in the browser.
  - Move the lockout and rate-limit error messages into a pure function in `lib/`, and
    split out the visual side panel.
  - Done as: a server `page.tsx` (session check + redirect, the static layout) and a
    client `LoginForm`; `loginErrorMessage` in `lib/login-errors.ts`; `loginSchema`.
  - `callbackUrl` is honoured, for same-site paths only.
  - Fixes: the rate limit answered with a redirect that `signIn()` can't read, so its
    message never showed (now JSON 429 with `RateLimitExceeded:<minutes>`); an unknown
    email and an inactive account no longer reveal that an account exists; login no
    longer lowercases the email (stored as typed).
- [x] 6.4 Delete the orphaned `app/admin/categories/[id]/page.tsx` (363 lines, unlinked,
  34 Persian strings). Then delete `POST`/`PATCH`/`DELETE` in `app/api/categories/**`,
  which no longer have callers. `GET` stays for the public pages.
- [x] 6.5 Dashboard redesign (already a server page), from `/impeccable`, inside the
  existing admin look:
  - Drop the `Order` tiles (orders, customers, pending, revenue) and "Recent orders".
    The table has 0 rows: the public form saves `QuickOrder`, and only the uncalled
    `POST /api/orders` writes `Order` (8.0 deletes it, W3 decides the models).
  - `PageHeader` (no eyebrow) and a `StatsBoard` row: open requests, new messages,
    products (with out of stock), last price update. `StatsBoard` gains `href` and
    `detail`, so each tile opens its filtered list.
  - Desk: the latest quote requests with status pills, each linking into the inbox.
  - Price board: an up / flat / down split of the catalog, then the latest
    `PriceHistory` changes (old → new, ▲/▼ percent, how long ago).
  - Recent activity: the first `AdminLog` viewer. It shows `userName`, plus "(deleted)"
    when `userId` is null, and a readable line built from each row's `details`.
  - Two columns on desktop, one on phones, and an empty state per panel.
- [x] 6.6 Delete `/api/admin/profile` once unused. Fix the `requireAuth` vs
  `requireSuperAdmin` placement in layouts, if any remain.
  - The 7 identical section layouts became one, in the route group `app/admin/(panel)/`
    (URLs unchanged; login stays outside, with no shell).
  - Layouts don't re-run on navigation, so every page now starts with `requireAuth()`
    (users: `requireSuperAdmin()`). `getAuthSession` is wrapped in React `cache()`, so
    the layout and the page share one session read per request.

- [x] 6.7 Dialog pass (shared `components/ui/dialogs.tsx`, `modal-dialog.tsx`), from the
  dialog critique:
  - Delete dialogs focus Cancel on open, with `role="alertdialog"` and `aria-describedby` on
    the body so "This can't be undone" is announced. Forms focus their first field.
  - A backdrop click doesn't close a form that has unsaved edits.
  - The mobile footer and sheets moved to M.4.
  - Smaller items: a blocked delete shows no dead button (Close + a link to the category's
    products); "Create" vs "Add" wording; a `min-w` on confirm buttons so pending text
    doesn't shift Cancel.
  - Done as: `ModalDialog` focuses `[data-autofocus]`, else a form's first field, and
    takes `role`, `describedBy` and `closeOnBackdrop`. `ConfirmDialog` is an
    `alertdialog` that starts on Cancel; its `blockedAction` replaces the confirm button.
    `DeleteDialog`'s `blocked` is now `{ label, href }`. `FormDialog` gets `dirty` from
    `useActionForm`. Create reads "Add {noun}" / "Adding…" / "{Noun} added".

## Phase 7: Public side

- [x] 7.0 `lib/data/`: data-access functions for the public reads that more than one
  place needs:
  - `catalog.ts`: `getCategories()`, `getCategory(slug)`, `getCategoryProducts(slug, subcategory?)`,
    `getManufacturers()`, `getManufacturer(slug)`; `prices.ts`: `getLatestPrices()`.
  - No `getProduct(slug)`: no public page shows one product (`[productId]` is a subcategory).
  - Each is wrapped in React `cache()`, returns DTOs (`toProductDTO`) and starts with
    `import 'server-only'`, which resolves to Next's bundled copy (no `yarn add`).
  - Admin pages keep their one-off queries inline and move them here only if reused.
  - Found: `/manufacturers/[postId]` 500s on `<Button as={NextLink}>` (a function prop into
    a HeroUI client component); 7.5 deleted the page.
- [x] 7.1 `order-request-modal.tsx` and `weight-calculator-modal.tsx`: untangle the effects
  and move the forms to RHF + zod.
  - Both sit on the exported `DialogFrame` (+ `DialogFooter`) and mount only while open.
  - `lib/schemas/quick-order.ts` is parsed by the form (`useActionForm`, posting through a
    fetch wrapper) and by `/api/quick-orders`, which now returns only the new id.
- [x] 7.2 Catalog pages:
  - `app/products/[categorySlug]/**` already query Prisma on the server (cached for an
    hour). Then `category-products.tsx` and `product-page.tsx` download the whole
    category again in the browser (`useProducts({ limit: 1000 })`, `useCategories()`).
  - Pass the data down as props from 7.0's functions instead, and keep the filtering as
    in-memory state in the client island.
  - Drop `useProducts`/`useCategories`.
  - Then split the two components (513 and 302 lines) into sections.
  - Done: shared `product-boards.tsx` (`ProductBoards` = mill tables + both dialogs,
    `NoMatches`), server `product-notes.tsx` passed in as `children`, `UnifiedProductPage`
    deleted, `getCategoryProducts` selects only the board's columns. The Excel import now
    revalidates `/products` (the boards are baked into the hourly-cached HTML).
- [x] 7.3 `product-slider.tsx` (`/api/latest-prices`) and `moment-news/page.tsx`
  (`/api/moment-news`): fetch on the server and pass the data down as props.
  - `getLatestPrices()` in `lib/data/prices.ts` (card fields only, `updated` formatted on
    the server so it hydrates the same everywhere); the home page `revalidate = 60`.
  - `/moment-news` deleted with its route and `moment-jalaali`: an unlinked leftover of
    the Persian site. `/api/latest-prices` deleted too (no callers left).
- [x] 7.4 `contact/page.tsx`: RHF + zod. Optionally switch it, and the order-request
  modal, from the API POST to a public Server Action. That would be rate-limited and
  zod-validated like `adminAction`, but without the login check.
  - Done: `publicAction` in `lib/actions.ts` (submit rate limit → zod → handler);
    `app/actions.ts` has `sendContactMessage` and `requestQuote`. `/api/contact` and
    `/api/quick-orders` deleted. The contact page is a server page with a client
    `ContactForm`. `blankOr` and `phone()` shared in `lib/schemas/fields.ts`.
  - Also fixed the contact map: CARTO tiles now need an API key (they served an
    "API key required" image), so it uses OSM's tiles; the zoom/attribution styles moved
    to unlayered CSS, since leaflet.css always beat the layered Tailwind classes.
- [x] 7.5 `about/page.tsx` and `manufacturers/[postId]`: move content into `config/` and
  split the sections.
  - About: content in `config/about.ts`, sections in `components/about/about-sections.tsx`
    (`Band` + `SectionIntro` for the repeated chrome); the closing band is a shared
    `CtaStrip`, also used by `/products`. `about/layout.tsx` deleted (a wrapper and a
    second `metadata`).
  - `/manufacturers` and `/manufacturers/[slug]` deleted with `BlogPostCard`,
    `public/images/blog` and `getManufacturer(s)`: an unlinked Persian leftover.
  - Page titles no longer repeat the brand: the product pages added "· Hormoz Steel" on
    top of the root layout's title template.
- [x] 7.6 Calculators: pure formulas in `lib/weight.ts`, with one `tsx --test` check. Also drop the
  `formatPrice` prop; every caller passes `formatUsd`.
  - `lib/weight.test.ts` (`yarn test`) checks against steel-table values. It caught three
    wrong formulas: rebar was 4× too heavy (d²π, not πd²/4); angle and hollow section
    counted their corners twice.
  - One `WeightCalculator({ type })` replaces the page's and the modal's switch; titles come
    from `config/weight-calculators.ts`. `includeVAT` (never set) dropped with `formatPrice`.
  - `linePrice` won't price a per-piece or per-metre product by weight (it used to treat
    METER as kg).
- [x] 7.7 Sweep out the Persian, RTL and `dir='ltr'` leftovers (including the `shamsh` and
  `qooti` keys in `config/category-icons.ts`, shown as icon names in the category form).
  - Also: `contact/layout.tsx` is only a wrapper + `metadata`; move the metadata into the
    (now server) page and delete the layout, as 7.5 did for about.
  - Also: the calculator modal still picks its calculator by Persian keywords too.
  - Done: no Arabic-script text or `dir='ltr'` left in the source. `shamsh`/`qooti` became
    `billet`/`tube` (the DB already used those; the navbar and footer linked to 404s).
    Deleted the disabled `FloatingOrderButton`, the unused Shamsh/Qooti icons, dead Radix
    menubar and Swiper pagination CSS, and `contact/layout.tsx`. Slugs no longer allow
    Persian letters; the product table reads `priceDirection` only.
- [x] 7.8 Delete the public GET routes that 7.2–7.3 leave without callers (grep first):
  - `/api/products`, `/api/products/[id]`
  - `/api/categories`, `/api/categories/[id]`
  - `/api/manufacturers`, `/api/manufacturers/[id]`

  Excel export must already have its own route by now (5.8).
  - Done, with the `useManufacturers`/`useManufacturer` hooks that called the mill routes.
    `toProductDTO`, `mapDirectionToLegacy` and `productInclude` died with them;
    `lib/product-dto.ts` is now `lib/manufacturer.ts` (`resolveManufacturerId`, using
    `slugify`, as `generateUniqueSlug` now does too).

## Phase 8: API and hooks cleanup

By now `app/api/` should hold only:
- NextAuth;
- the notifications poll (4.6);
- Excel import/export (5.8);
- the two public form POSTs, unless 7.4 turned them into actions.

So most of this phase is checking that the remaining routes are complete.

- [x] 8.0 **Security, do early.** These admin handlers have no auth check (found in 1.2;
  `middleware.ts` only guards `/admin` pages, not `/api`):
  - ~~`products` POST, `products/[id]` PATCH/PUT/DELETE~~ deleted in 5.9, with `products/bulk`
  - ~~`manufacturers` POST, `manufacturers/[id]` PUT/DELETE~~ deleted in 2.7
  - ~~`contact` GET (lists customer messages), PATCH, DELETE~~ deleted in 4.7
  - ~~`orders` GET (lists orders) and POST~~ deleted in 8.0, with `useOrders`/`useCreateOrder`

  Public on purpose: `contact` POST, `quick-orders` POST, `auth/[...nextauth]`.

  Phases 2, 4 and 5 eventually delete most of these handlers (see the *(from 8.0)*
  steps). Until then they stay open. The quick fix is one `requireApiAuth()` guard per
  handler, on a `fix/api-auth` branch before Phase 2. Nothing calls `/api/orders` at all
  (only the unused `useOrders`/`useCreateOrder` hooks reference it), so that route and
  both hooks can simply be deleted.
- [x] 8.1 Inventory `app/api/`: every remaining route needs one of the reasons above.
  Delete anything without a caller. Left: NextAuth, the notifications poll, Excel
  export/import (7.4 made the public forms Server Actions). Also deleted the unused
  `resetRateLimit`.
- [x] 8.2 Every remaining route:
  - validates with zod, using the shared `lib/schemas/*`;
  - starts with the rate-limit guard;
  - uses `requireApiAuth()` unless it's public on purpose.

  The notifications and export routes already did. The Excel import became the
  `importProducts` action (all rows or none), sharing `saveProduct` with the form.
- [x] 8.3 Delete `hooks/use-api.ts`. The bell's SWR hook (4.6) lives in its own file;
  every other hook in it has been replaced by server reads or actions.
- [x] 8.4 Rewrite CLAUDE.md for the final model (written fresh: the re-clone had lost it;
  it stays gitignored):
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

- [x] W0 Prisma fundamentals, then migration hygiene (drift check and baseline).
  - The live DB matched the schema, but none of the 9 migrations were recorded (it was
    built with `db push`). They were squashed into one `0_init`, generated with
    `migrate diff --from-empty`, and marked applied with `migrate resolve --applied`.
  - `migrate dev --create-only` produced an empty migration: replaying `0_init` in the
    shadow DB gives the schema exactly. The shadow DB is the one allowed exception to
    "only `ahanhormoz_demo`".
  - `yarn db:push` was deleted; a fresh setup runs `yarn prisma migrate deploy`.
- [x] W1 Catalog (Category, Manufacturer, Product), migration `20261021080016_catalog_money_restrict`:
  - money `Float` → `Decimal(12,2)` on all six money columns (Product and PriceHistory,
    which copy into each other); no stored value had more than 2 decimals, so nothing
    rounded. `weightKg` stays `Float`.
    - Decimals stay on the server: `setProductPrice` and the dashboard's percent use
      Decimal math; every read that renders or leaves the server (`lib/data/*`, the admin
      products page, the export) calls `.toNumber()`, since a client prop can't be a Decimal.
  - Category→Product `Restrict`: Postgres refuses (`23001`) when products remain;
    `deleteCategory` keeps its count for the readable message.
  - subcategory: kept as text labels. `updateCategory` refuses to drop a label that
    products still use (a `ponytail:` note names the Subcategory table as the upgrade).
  - index review with `EXPLAIN ANALYZE` on 50k fake rows (rolled back): `price` and
    `inStock` stay (`LIMIT 20` sort, rare out-of-stock); `[categoryId]` + `[subcategory]`
    became one `[categoryId, subcategory]`, which still serves the foreign key.
  - `migrate dev` stops at the data-loss prompt in a non-interactive shell: write the SQL
    with `migrate diff --from-schema-datasource … --to-schema-datamodel …` into a folder
    named with a **UTC** timestamp, then `migrate deploy`.
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
