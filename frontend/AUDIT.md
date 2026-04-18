# Codebase Audit — Expressions India Admin Frontend

**Date:** 2026-04-08
**Scope:** Full frontend codebase review

---

## Critical Issues

### 1. Hardcoded `localhost` URLs (will break in any non-local environment)

**Files:**
- `src/routes/admin/index.tsx:28` — `fetch("http://localhost:8000/admin/promotion")`
- `src/components/HomePageImageEdit.tsx:274` — `fetch("http://localhost:8000/admin/promotion", ...)`

These should use `import.meta.env.VITE_SERVER_URL` like every other API call in the project.

---

### 2. Empty/broken `config.ts`

**File:** `src/config.ts:7`

```ts
export const cfg: Config = {
  serverEndPoint:    // <-- no value assigned
}
```

This is a syntax oddity (TypeScript allows trailing commas so it may parse as `undefined`). The config object is never used anywhere — all API calls use `import.meta.env.VITE_SERVER_URL` directly. This file is dead code that suggests an incomplete migration.

---

### 3. No authentication or route protection

There are no auth guards, login routes, token management, or protected route wrappers. Every `/admin/*` route is accessible to anyone. This is a critical security gap if the app is deployed publicly.

---

### 4. Memory leak in `HomePageImageEdit.tsx` ✅ FIXED

**File:** `src/components/HomePageImageEdit.tsx:180`

**Fix Applied:** Added `objectUrlsRef` to track all created object URLs. Implemented `useEffect` cleanup to revoke all URLs on unmount.

---

### 5. Silent error swallowing in `HomePageImageEdit.tsx` ✅ FIXED

**File:** `src/components/HomePageImageEdit.tsx:280`

**Fix Applied:** Removed try-catch block. Function now properly throws errors, and also fixed the hardcoded localhost URL to use `import.meta.env.VITE_SERVER_URL`.

---

### 6. `.env` committed with local IP address

**File:** `.env`

```
VITE_SERVER_URL="http://192.168.1.12:8000"
```

This is a local network IP. It should be in `.env.local` (gitignored) and `.env` should only contain `VITE_SERVER_URL=` as a placeholder. If this is committed to git, other developers or CI will hit the wrong server.

---

## Major Issues

### 7. Inconsistent API response parsing between features ✅ FIXED (in parser consistency)

**File:** Related to parser implementations in `src/lib/api.ts`

**Fix Applied:** `parsePaginatedResponse` now throws `ApiError` like `parseApiResponse` does (see bug 8). Note: Journal and enquiry endpoints still use non-paginated responses from backend. Course now follows the pagination pattern. When backend is updated for journal/enquiry pagination, update their fetch functions accordingly.

---

### 8. Inconsistent error handling in `parsePaginatedResponse` vs `parseApiResponse` ✅ FIXED

**File:** `src/lib/api.ts`

**Fix Applied:** Updated `parsePaginatedResponse` to throw `ApiError` with HTTP status code (line 58), matching `parseApiResponse` behavior. Now `retryUnless404` policy works consistently across all endpoints.

---

### 9. `InfoCard` component duplicated 5 times ✅ FIXED

The same `InfoCard` component was copy-pasted in 5 routes (and now also used in course).

**Fix Applied:** Extracted to shared component `src/components/InfoCard.tsx`. All view pages now import and use this shared component:
- `article/$id.tsx`
- `event/$id.tsx`
- `journal/$id.tsx`
- `podcast/$id.tsx`
- `enquiry/$id.tsx`
- `course/$id.tsx`

---

### 10. Audience toggle logic duplicated 3 times ✅ FIXED

The identical `toggleAll` / `toggleIndividual` audience checkbox logic was copy-pasted across 3 forms (and now also in course).

**Fix Applied:** Extracted to shared hook `src/features/event/hooks/useAudienceToggle.ts`. All form layouts now use this hook:
- `article/_formLayout.tsx`
- `event/_formLayout.tsx`
- `podcast/_formLayout.tsx`
- `course/_formLayout.tsx`

---

### 11. `JournalSchema.media` is non-nullable but UI treats it as optional

**File:** `src/features/journal/types.ts:44` — `media: MediaSchema` (required, non-nullable)
**File:** `src/routes/admin/journal/$id.tsx:89` — `const isPdf = journal.media?.fileType?.includes("pdf");`
**File:** `src/routes/admin/journal/$id.tsx:214` — `{journal.media && (...)}`

The schema says `media` is always present, but the UI checks for nullability. If the API ever returns a journal without media, Zod will throw a parse error before the component even renders.

---

### 12. `JournalChapterSchema.media` is non-nullable but can be null

**File:** `src/features/journal/types.ts:30` — `media: MediaSchema` (required)

But in `_formLayout.tsx:147`, when constructing existing chapters, it handles `ch.media` being falsy:
```ts
media: ch.media ? { type: "existing" as const, ... } : null,
```

If a chapter has no PDF, Zod parsing will fail. Should be `media: MediaSchema.nullable()`.

---

### 13. Article delete mutation missing `meta.successMessage`

**File:** `src/routes/admin/article/$id.tsx:54-66`

All other detail pages (event, journal, podcast, enquiry) include `meta: { successMessage: "X deleted" }` on the delete mutation, but the article detail page does not. Users won't see a success toast when deleting an article.

---

### 14. No HTTP error handling for fetch failures

None of the API fetch functions handle network errors (e.g., server unreachable). `fetch()` will throw a `TypeError` on network failure, but:
- This won't have a useful message ("Failed to fetch")
- It won't have a status code
- The global `onError` handler in `main.tsx` will just show "Failed to fetch"

Consider wrapping fetch calls to provide better error messages when the server is unreachable.

---

### 15. `EventListSchema.status` uses `z.string()` while `EventSchema.status` uses `z.enum()`

**File:** `src/features/event/types.ts`
- Line 37: `status: z.string().default("")` (list schema — accepts any string)
- Line 64: `status: z.enum(["upcoming", "ongoing", "completed"])` (detail schema — strict enum)

The list schema should also use the enum for type safety, or the mismatch could cause confusing bugs.

---

### 16. `PROGRAM_STATUS` constant includes "cancelled" but `EventSchema` enum doesn't

**File:** `src/features/event/types.ts:5` — `["upcoming", "completed", "cancelled"]`
**File:** `src/features/event/types.ts:64` — `z.enum(["upcoming", "ongoing", "completed"])`

The constant has "cancelled" but the schema has "ongoing" instead. The constant isn't used anywhere, suggesting it's stale.

---

### 17. `AudienceListItemSchema` uses `ID` (uppercase) inconsistent with every other schema

**File:** `src/features/audience/types.ts:4` — `ID: z.number()`

Every other schema in the project uses lowercase `id: z.string()` or `id: z.uuid()`. This uses uppercase `ID` with type `number`. This suggests the audience API response format differs from all others.

---

## Minor Issues

### 18. `console.log` statements left in production code

- `src/routes/admin/index.tsx:32` — `console.log(err)`
- `src/features/podcast/api/fetchPodcast.ts:5` — `console.log(url)`
- `src/components/HomePageImageEdit.tsx:53-54` — `console.log("SENDING!!!.")`
- `src/components/HomePageImageEdit.tsx:211` — `console.log(updatedFiles)`

---

### 19. Typo: "Upadated" in HomePageImageEdit.tsx

**File:** `src/components/HomePageImageEdit.tsx:65`

```tsx
<p className="text-lg text-emerald-700">Upadated Home Page Images Successfully</p>
```

Should be "Updated".

---

### 20. Dead code in `src/routes/admin/index.tsx`

**File:** `src/routes/admin/index.tsx`

The component renders an empty `<></>`. The `fetchHomePageImages` function and `useHomePageImageQuery` hook are defined but never called (usage is commented out on lines 15-22). The `navigate` and `HomePageImageEdit` imports are also unused.

---

### 21. Inconsistent ID validation across schemas

| Schema            | ID field          |
|-------------------|-------------------|
| ArticleSchema     | `z.string()`      |
| EventSchema       | `z.uuid()`        |
| PodcastSchema     | `z.uuid()`        |
| JournalSchema     | `z.string()`      |
| EnquirySchema     | `z.string()`      |
| AudienceSchema    | `z.number()`      |

Some use `z.string()`, some `z.uuid()`, one `z.number()`. If they're all UUIDs from the same backend, they should all use `z.uuid()` for consistent validation.

---

### 22. `MAX_FILE_SIZE` declared but never used

**File:** `src/features/event/types.ts:3`

```ts
const MAX_FILE_SIZE = 20 * 1024 * 1024;
```

Never referenced anywhere. No file size validation exists on the frontend.

---

### 23. Inline `fetch()` calls for DELETE in route files bypass the API layer

Every detail page (`$id.tsx`) defines its own inline DELETE mutation with `fetch()` directly:
- `src/routes/admin/article/$id.tsx:56`
- `src/routes/admin/event/$id.tsx:87`
- `src/routes/admin/journal/$id.tsx:53`
- `src/routes/admin/podcast/$id.tsx:70`
- `src/routes/admin/enquiry/$id.tsx:54`

These should use dedicated `deleteArticle()`, `deleteEvent()`, etc. functions in the API layer for consistency.

---

### 24. `HomePageImageEdit.tsx` uses `alert()` for error handling

**File:** `src/components/HomePageImageEdit.tsx:293`

```ts
onError: (error: Error) => {
  alert("Failed to submit event " + error.message);
}
```

This uses a browser `alert()` while the rest of the app uses `sonner` toast notifications.

---

### 25. Query key inconsistency — journal and enquiry missing `list` key

**File:** `src/lib/query-keys.ts`

Article, event, and podcast keys all define a `list` key factory for parameterized queries. Journal and enquiry only define `all` and `detail` — no `list`. This is consistent with their current non-paginated implementation, but will need updating when pagination is added.

---

### 26. `ArticleSchema.audience` uses `z.object({ name: z.string() })` while events use `z.array(z.string())`

- `src/features/article/types.ts:23` — `audience: z.array(z.object({ name: z.string() }))`
- `src/features/event/types.ts:65` — `audiences: z.array(z.string())`

The article API returns audience as objects with a `name` field, while events return just strings. This inconsistency flows through to the form where articles need `.map(a => a.name)` but events don't.

---

### 27. Missing `useEffect` cleanup for carousel event listener

**File:** `src/components/HomePageImageEdit.tsx:88-90`

```ts
carouselApi.on("select", () => {
  setCurrent(carouselApi.selectedScrollSnap() + 1);
});
```

An event listener is registered on the carousel API but never unsubscribed. The cleanup function on line 91-93 only resets `current` to 1 — it doesn't remove the `"select"` listener. If the carousel API instance persists across re-renders, old listeners will accumulate.

---

### 28. Event form status only offers "upcoming" and "completed", but schema includes "ongoing"

**File:** `src/routes/admin/event/_formLayout.tsx:706`

```ts
{(["upcoming", "completed"] as const).map((s) => (...))}
```

**File:** `src/features/event/types.ts:64`

```ts
status: z.enum(["upcoming", "ongoing", "completed"])
```

Users cannot set status to "ongoing" through the form. If this is intentional (server handles it), consider documenting it. If not, it's a missing UI option.

---

### 29. `HomePageImagePropsSchema` and `HomePageProps` type are unused exports

**File:** `src/components/HomePageImageEdit.tsx:266-270`

Exported but never imported anywhere.

---

### 30. `.env` file checked into version control

The `.env` file containing `VITE_SERVER_URL` with a local IP is present in the repo root. Typically `.env` should be in `.gitignore`, with a `.env.example` file committed instead.

---

### 31. Missing error boundary in root route

**File:** `src/routes/__root.tsx`

No error boundary or `errorComponent` wraps the app. If any route throws an unhandled error, users see a blank page with no fallback UI or recovery option. TanStack Router supports `errorComponent` on routes — use it.

---

### 32. Iframe without `sandbox` attribute

**File:** `src/routes/admin/podcast/$id.tsx:164-169`

```tsx
<iframe
  src={getEmbedUrl(podcast.link)!}
  allowFullScreen
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; ..."
/>
```

YouTube embed iframe has no `sandbox` attribute. Add `sandbox="allow-same-origin allow-scripts allow-presentation"` to limit the embedded content's capabilities.

---

### 33. Journal and enquiry list pages silently show empty table on error

**Files:**
- `src/routes/admin/journal/index.tsx`
- `src/routes/admin/enquiry/index.tsx`

When the API call fails, these pages render an empty `<DataTable>` with no error message. Article, event, and podcast list pages handle errors more visibly.

---

### 34. Unsafe non-null assertions (`id!`) in query hooks

**Files:**
- `src/features/event/hooks/useEventQuery.ts:8-9`
- `src/features/podcast/hooks/usePodcastQuery.ts:8-9`
- `src/features/article/hooks/useArticleQuery.ts:8-9`
- `src/features/enquiry/hooks/useEnquiryQuery.ts:8-9`

```ts
queryKey: eventKeys.detail(id!),
queryFn: () => fetchEvent(id!),
```

The `id` parameter is optional, but used with `!` assertion. While `enabled: !!id` prevents the query from running, the `queryKey` is still evaluated with `undefined`, which could cause cache key collisions.

---

### 35. `useJournalQuery` missing `enabled` check unlike other hooks

**File:** `src/features/journal/hooks/useJournalQuery.ts`

```ts
export function useJournalQuery(id: string) {
  return useQuery({ queryKey: journalKeys.detail(id), queryFn: ... });
}
```

Other hooks (article, event, podcast, enquiry) accept `id?: string` and include `enabled: !!id`. Journal requires a non-optional `id` with no safety check — inconsistent pattern.

---

### 36. `response.json()` can throw on non-JSON responses (HTML error pages)

**File:** `src/lib/api.ts:26,56,82`

All three parse functions call `response.json()` without catching `SyntaxError`. If the server returns an HTML error page (502, 503), this will throw an unhelpful JSON parse error instead of a meaningful message.

---

### 37. Inconsistent Zod import style (`import z` vs `import { z }`)

**Files using wrong default import:**
- `src/features/enquiry/types.tsx:1`
- `src/features/audience/types.ts:1`
- `src/features/enquiry/api/fetchEnquiryList.ts:2`
- `src/features/audience/api/fetchAudienceList.ts:2`

These use `import z from "zod"` (default import) while the rest of the codebase uses `import { z } from "zod"` (named import). This works due to Zod's export setup but is inconsistent and could break with stricter ESM settings.

---

### 38. Unpinned `"latest"` dependencies in `package.json`

Several TanStack dependencies use `"latest"` instead of pinned versions:
- `@tanstack/react-devtools`
- `@tanstack/react-router`
- `@tanstack/react-router-devtools`
- `@tanstack/devtools-vite`
- `@tanstack/router-plugin`

This means any `npm install` could pull in breaking changes without warning.

---

### 39. Missing validation on enquiry schema fields

**File:** `src/features/enquiry/types.tsx`

```ts
email: z.string(),   // should be z.string().email()
phone: z.string(),   // no phone format validation
```

No email format or phone validation. Invalid data passes through without complaint.

---

### 40. Memory leak in `media-upload.tsx` — `mediaPreviewUrl()`

**File:** `src/components/media-upload.tsx`

```ts
export function mediaPreviewUrl(m: LocalMedia): string {
  if (m.type === "new") return URL.createObjectURL(m.file);
  return m.url;
}
```

Same `URL.createObjectURL()` leak as in `HomePageImageEdit.tsx` — called on every render without `revokeObjectURL()`. This affects all media upload sections across every form.

---

### 41. Extra whitespace in journal table header

**File:** `src/features/journal/table-types.tsx:13`

```ts
header: " Title",  // leading space
```

Renders as " Title" with a leading space in the table header.

---

### 42. Lowercase header in enquiry table

**File:** `src/features/enquiry/table-types.tsx:18`

```ts
header: "name",  // should be "Name"
```

All other table headers use Title Case. This one is lowercase.

---

### 43. No 404 / not-found route handler

**File:** `src/routes/`

No catch-all route exists for invalid URLs. Users navigating to a non-existent path see a blank page. TanStack Router supports `notFoundComponent` on the root route.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 6     |
| Major    | 16    |
| Minor    | 21    |
| **Total**| **43**|
