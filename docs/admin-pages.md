# How an admin page works

`app/admin/categories` is the template for every admin CRUD page (list, search, add,
edit, delete). Phase 1 of `docs/refactor-plan.md` built it, replacing one 884-line
client component. This explains the ideas behind it, then lists the steps to apply
them to the next page.

## The files

| File | Job | Runs on |
|---|---|---|
| `app/admin/categories/page.tsx` | Reads the database, filters by `?q=`, lays out the page | server |
| `app/admin/categories/actions.ts` | `createCategory`, `updateCategory`, `deleteCategory` | server |
| `lib/schemas/category.ts` | The rules for a valid category | both |
| `components/admin/categories/categories-table.tsx` | Rows, plus which are expanded, edited or being deleted | browser |
| `components/admin/categories/category-form-dialog.tsx` | The add/edit form | browser |
| `components/admin/categories/delete-category-dialog.tsx` | Confirm, then delete | browser |

These are built from shared pieces:

- `components/admin/*`: `PageHeader`, `StatsBoard`, `SearchToolbar`, `DataCard`, `EmptyState`
- `components/ui/dialogs.tsx`: `FormDialog`, `ConfirmDialog`, `formModeCopy` (add/edit wording)
- `components/ui/dialog-button.tsx`: `DialogButton`, which opens a dialog from a server page
- `components/ui/dialog-scope.tsx`: `DialogScope` and `useCloseDialog()`, how every dialog closes
- `components/ui/field.tsx`: `FormField`, `Input`, `Select`, `Textarea`, `invalidProps`
- `lib/actions.ts`: `adminAction`
- `lib/action-toast.ts`: `toastResult`

## 1. Server components and client components

A component file **without** `'use client'` is a server component. It runs only on the
server, so it can be `async` and query Prisma directly. The browser receives finished
HTML and none of that component's JavaScript:

```tsx
export default async function CategoriesPage({ searchParams }) {
  const categories = await prisma.category.findMany({ ... })
  return <CategoriesTable categories={visible} />
}
```

Compare the old page, which made five hops before showing any data:

1. The browser receives an empty shell with a spinner.
2. It downloads the page's JavaScript.
3. `useEffect` runs `fetch('/api/categories')`.
4. The API route queries Prisma and returns JSON.
5. `setState` stores the result and React redraws.

The new page makes one: the server queries Prisma and sends HTML that already contains
the data.

**Why it's always fresh.** `app/admin/categories/layout.tsx` calls `requireAuth()`,
which reads the session cookie. A route that reads cookies is rendered per request,
so there's no stale cached copy and no need for `export const dynamic`.

### Where `'use client'` goes

`'use client'` marks a **boundary**: a file that server components import directly.
A file that only client components import is browser code automatically, and it
shouldn't carry the directive.

| File | Imported by | `'use client'`? |
|---|---|---|
| `categories-table.tsx` | `page.tsx` (server) | yes |
| `components/ui/dialog-button.tsx` | `page.tsx` (server) | yes |
| `category-form-dialog.tsx` | `page.tsx` (server), inside `DialogButton` | yes |
| `delete-category-dialog.tsx` | client components only | no |
| `components/ui/dialogs.tsx` | client components only | no |
| `components/ui/dialog-scope.tsx` | client components only | no |

The reason this matters: props that cross from server to client are serialized, and
functions can't be. Server Actions are the one exception, because they cross as
references, and Next's TypeScript plugin only accepts them in a prop named `action`
or `…Action`. If you mark a file whose components take other callbacks (`onClose`,
`onSubmit`) with `'use client'`, the plugin warns with code 71007.

### Opening a dialog from a server page

A server page can't hand a client button a component or an `onClose` function, but it
can hand it an **element** whose props are plain data or Server Actions:

```tsx
// page.tsx (server)
<DialogButton label='Add category'>
  <CategoryFormDialog mode='create' action={createCategory} />
</DialogButton>
```

`DialogButton` mounts its `children` only while open. The dialog closes itself with
`useCloseDialog()`, which reads a close function from context. Dialogs opened from
state, like the table's Edit and Delete, get the same context from
`<DialogScope onClose={…}>`. Every dialog closes the same way, and no entity needs
its own "Add" button component.

### Keep server-only code out of client imports

A client component ships **everything it imports, transitively**. The category schema
is imported by the browser form, so it must never import Prisma, even indirectly. That
is why `isValidSlug`/`slugify` live in the Prisma-free `lib/slug.ts`, while
`generateUniqueSlug`, which queries the database, stays in `lib/slug-generator.ts`.

## 2. Client islands: keep the browser part small

Only things that change in response to a click, without asking the server, need
browser state:

| State | Where it lives | Why |
|---|---|---|
| The categories | Database → server page → props | One source of truth |
| The search text | The URL (`?q=`) | Survives reloads, can be shared, works with back/forward, readable by the server |
| Expanded rows, the row being edited or deleted | `useState` in `CategoriesTable` | Pure UI; nobody else needs it |
| Form values, errors, busy flag | react-hook-form inside the dialog | Disappears with the dialog |

That leaves the page as server HTML with a few small islands of JavaScript: the table
and the add button (`DialogButton`).

Some rules that keep the islands simple:

- **Store "which item is open", not "is it open".** `editing: CategoryRow | null`
  replaces the old trio of `selectedCategory`, `editModalOpen` and `editForm`, which
  could drift apart.
- **Mount dialogs only while open:**
  `{editing ? <DialogScope onClose={…}><Dialog /></DialogScope> : null}`. Each opening
  starts from fresh `defaultValues`, with nothing to reset by hand.
- **Rows report clicks; the table decides.** Rows get `onEdit`/`onDelete`/`onToggle`
  callbacks and own no state.

### Search through the URL

`SearchToolbar` is a GET form built on `next/form`. Submitting navigates to
`/admin/categories?q=rebar` without a full reload. Next then re-runs the server page
with the new `searchParams` and swaps in the result. The page treats the URL as
untrusted input:

```ts
const { q } = await searchParams          // a Promise since Next 15
const query = typeof q === 'string' ? q.trim() : ''   // ?q=a&q=b gives an array
```

Categories are filtered in memory so the stats still count everything. There are a
dozen rows. For tables that grow, such as products and orders, filter in Prisma's
`where` instead.

## 3. Writing: Server Actions

A file starting with `'use server'` exports functions the browser can call like normal
functions:

```tsx
// page.tsx (server) passes the action to the browser form
<CategoryFormDialog mode='create' action={createCategory} />
```

When building the browser bundle, Next replaces `createCategory` with a stub. Calling
the stub sends a POST request to the server, which runs the real function and returns
its result. Database code never reaches the browser.

**Every Server Action is a public endpoint.** Anyone can POST to it without going
through the UI, so `adminAction` (in `lib/actions.ts`) wraps each one with the same
checks, in this order:

1. **Auth:** `requireAuth()` redirects if not logged in. This runs outside the
   `try`, so the redirect reaches Next instead of being caught as an error.
2. **Rate limit:** `checkApiRateLimit` per IP. This is not `checkRateLimit`, which is
   the 5-attempt login limiter.
3. **Validation:** `schema.safeParse`. A failure returns
   `{ success: false, fieldErrors }`, and the handler never runs.
4. **The handler:** it receives already-clean data. Errors are mapped:
   - a thrown `ActionError` returns its message to the user;
   - Prisma `P2002` becomes "That slug is already taken.";
   - Prisma `P2025` becomes "This record no longer exists.";
   - anything else is logged and shown as a generic message.

Handlers stay short because of this:

```ts
export const createCategory = adminAction(categorySchema, async (data, { audit }) => {
  const category = await prisma.category.create({ data })
  await audit('CREATE', 'Category', category.id, { name: category.name })
  revalidateCategoryPages()
})
```

### One schema, two jobs

`lib/schemas/category.ts` describes the form's shape as its **input** (empty strings,
`{ value }` rows for `useFieldArray`) and the database's shape as its **output**
(`null`s, a plain `string[]`, a derived slug).

- **The browser** validates with `zodResolver(categorySchema, undefined, { raw: true })`.
  Errors appear under each field, but the submit handler still receives the raw form
  values.
- **The server** parses the same values again and writes the transformed output.

The browser check is a convenience; the server check is the real one. Anything the
browser shows can be out of date. For example, the delete dialog greys out Delete when
`_count.products > 0`, and `deleteCategory` still counts the products again itself.

### Showing the result

`toastResult(result, message, setError)` shows a green or red toast and copies any
`fieldErrors` into react-hook-form. It returns `true` on success, so callers write
`if (toastResult(...)) onClose()`. On failure the dialog stays open with the user's
input intact.

The busy flag depends on where the action is called from:

- **from a form:** react-hook-form's `isSubmitting`;
- **from a single button** (delete): `useTransition`, which sets `pending` until the
  async function finishes, with no `try/finally`.

## 4. `revalidatePath`: telling Next what changed

Next keeps rendered copies of pages. After a write, the action names the pages that
show this data:

```ts
revalidatePath('/admin/categories')        // the admin list
revalidatePath('/products', 'layout')      // /products and every page under it
```

This does two things:

1. **It drops cached copies.** The public catalog pages set `revalidate = 3600`, so
   without this a rename would take up to an hour to appear there. `'layout'` covers
   every nested route, including `/products/[categorySlug]`.
2. **It refreshes the current page in the same response.** When `revalidatePath` runs
   inside a Server Action, Next re-renders the affected route and sends it back with
   the action's result. That's why the table updates after a save without any refetch
   code.

Client state survives the refresh. React updates the existing `CategoriesTable` with
new props instead of remounting it, so expanded rows stay expanded.

## Applying the template to another page

1. **Schema:** `lib/schemas/<entity>.ts`. Input is the form's shape, output is
   Prisma's shape. Import nothing server-only.
2. **Actions:** `app/admin/<entity>/actions.ts` with `'use server'`.
   - Wrap each action in `adminAction`; pass `{ superAdmin: true }` for user
     management.
   - Call `audit` after each write.
   - Revalidate every path that shows the entity, public pages included.
   - Throw `ActionError` for refusals the user should read.
3. **Page:** a server component. Read with Prisma, `select` only the columns the table
   uses, read `?q=` (and other filters) from `searchParams`, and compose the shared
   admin components.
4. **Islands:**
   - a table holding only UI state. It gets `'use client'` only once it has some
     (manufacturers' table stayed server-rendered until it needed Edit and Delete);
   - a `'use client'` form dialog that takes `mode` and `action`, using
     react-hook-form, `zodResolver` in raw mode, `useFieldArray` for lists,
     `formModeCopy` for its wording and `useCloseDialog()` to close;
   - a delete dialog using `ConfirmDialog`, `useTransition` and `useCloseDialog()`;
   - the page's Add button is `<DialogButton>` with the form dialog as its child.
5. **API routes:** before deleting an admin-only handler in `app/api/**`, grep for
   other callers. Any handler that stays must check `requireApiAuth()` (see plan item
   8.0).
6. **Check:** run `yarn lint:check`, `yarn tsc --noEmit -p .` and `yarn build`. Then,
   in the browser, try each of these:
   - an empty submit;
   - a duplicate unique field;
   - editing a row;
   - deleting a row with and without dependent records.
