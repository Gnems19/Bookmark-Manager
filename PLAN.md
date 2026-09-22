# Bookmark Manager — Implementation Plan

Saved so we can implement **one step at a time**. Do not start the next step until the current step’s checklist passes in the browser.

**Source brief:** React Bookmark Manager (components, props, state, forms, lists, `useEffect`, composition).

**Design:** [Figma — bookmark-manager-app](https://www.figma.com/design/giO3ChUIk9nSfgzW6aEVh5/bookmark-manager-app?node-id=234-4992)

**Seed data:** [Google Drive folder](https://drive.google.com/drive/folders/1Vefm1LDIQecRTE2brAc8LeZmRUZUb_Vu?usp=sharing) — download into `public/data/bookmarks.json` during Step 3. Do not invent a replacement dataset if the provided file is available.

**Current repo:** README only. No app scaffold yet.

---

## How we will work

1. Pick the next unchecked step.
2. Implement only that step.
3. Run the app and exercise the new behavior (click, type, submit, refresh).
4. Check the step’s “Done when” list, then move on.

Visual match to Figma matters, and correct React architecture matters more. Each step should leave the app runnable.

---

## Assignment limits

Stay inside these limits for the whole project. They are grading rules.

- Functional components and JSX only.
- State with `useState`. Shared data through props and callback props.
- One wrapper that uses `props.children` (the modal).
- Lists rendered with `.map()` and a stable `id` as `key`.
- Add and edit use one controlled form (`value` + `onChange`, `onSubmit` + `preventDefault`).
- Array and object updates copy data (`map`, `filter`, spread). Never `push`, never `bookmarks[i].title = ...`, never mutate props.
- Initial bookmarks load with `fetch("/data/bookmarks.json")` inside `useEffect`. Do not import the JSON file as a module.
- Persist `bookmarks` and `theme` in `localStorage`.
- Show loading, empty, and error UI with conditional rendering.

Leave these out. They fail the brief even if they are common in production apps:

- Redux, Zustand, MobX, Recoil, or any other external state library.
- React Hook Form, Formik, Yup, or Zod.
- `document.querySelector`, `innerHTML`, `classList`, or `style.display` to drive UI.
- `window.location.reload()` after add, edit, or delete.
- `key={index}` when a bookmark has an `id`.
- A single `App.jsx` that contains the whole UI and every handler.

Allowed best practices that still fit the brief: Vite, custom hooks, pure helper functions, CSS variables, semantic HTML, and a small amount of React context only if prop drilling becomes unreadable. Default path is hooks plus props, because the brief grades that explicitly.

---

## Target architecture

```
bookmark-manager/
├── public/
│   └── data/
│       └── bookmarks.json          # seed only; fetched, never imported
├── src/
│   ├── main.jsx
│   ├── App.jsx                     # shell only: theme + data hook + layout
│   ├── index.css                   # tokens, reset, light/dark variables
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx          # children = page content
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── bookmarks/
│   │   │   ├── BookmarkList.jsx
│   │   │   ├── BookmarkCard.jsx
│   │   │   └── TagList.jsx
│   │   ├── filters/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   └── SortSelect.jsx
│   │   ├── form/
│   │   │   └── BookmarkForm.jsx    # add and edit
│   │   └── ui/
│   │       ├── Modal.jsx           # reusable, props.children, no bookmark knowledge
│   │       ├── ConfirmDialog.jsx
│   │       ├── EmptyState.jsx
│   │       └── LoadingState.jsx
│   ├── hooks/
│   │   ├── useBookmarks.js         # load, persist, CRUD
│   │   └── useTheme.js
│   ├── utils/
│   │   ├── selectBookmarks.js      # view + search + tag + sort (pure)
│   │   ├── validateBookmark.js     # pure
│   │   └── storage.js
│   └── constants.js
├── package.json
└── README.md
```

`App.jsx` renders layout and passes data down. `BookmarksPage` (or the page section inside `App` if it stays thin) owns view UI state: search text, selected tag, sort, active view, which modal is open. Presentational components receive data and callbacks. They do not own the bookmark list.

### What lives in state

| State | Owner | Why it is stored |
| --- | --- | --- |
| `bookmarks` | `useBookmarks` | Source of truth |
| `status` | `useBookmarks` | `loading` / `ready` / `error` |
| `theme` | `useTheme` | User choice, persisted |
| `view` | page | `all` or `archived` |
| `searchTerm` | page | Controlled search input |
| `selectedTag` | page | `all` or one tag |
| `sort` | page | `newest`, `oldest`, `az`, `za` |
| `formMode` | page | closed, add, or edit |
| `editingId` | page | Which bookmark the form edits |
| `confirmId` | page | Delete confirmation target |

### What is derived during render

Do not store these in state:

- Visible list (view + search + tag + sort + pinned-first).
- Tag options for the filter bar.
- Whether the current screen is an empty list, an empty search, or an empty archive.
- Domain label parsed from a bookmark URL.

```js
const visibleBookmarks = selectBookmarks(bookmarks, {
  view,
  searchTerm,
  selectedTag,
  sort,
});
```

### Bookmark shape

Normalize seed data into this shape once, at load time. If the Drive file uses different field names, map them in one function and keep the rest of the app on this shape.

```js
{
  id: "stable-id",
  title: "React Docs",
  url: "https://react.dev",
  description: "",
  tags: ["react"],
  isPinned: false,
  isArchived: false,
  createdAt: "2026-09-01T10:00:00.000Z"
}
```

New bookmarks get `crypto.randomUUID()` and a `createdAt` timestamp. Edits keep the same `id` and `createdAt`.

### Sort and pin rule

Pinned bookmarks always render before unpinned ones. Inside each group, apply the selected sort:

- `newest` / `oldest` by `createdAt`
- `az` / `za` by title, case-insensitive

### localStorage rule

Two effects, with a guard so the first render cannot wipe saved data:

1. On mount: wait briefly (`setTimeout`, cleared on cleanup), then read storage. If bookmarks exist, use them. If not, `fetch("/data/bookmarks.json")`, normalize, and store. Then set `status` to `ready`. On failure, set `status` to `error`.
2. When `bookmarks` changes: write to `localStorage` only if `status === "ready"`.

Theme: initialize from `localStorage` with a lazy `useState` initializer so the first paint matches the saved theme. A separate effect writes the theme and sets `document.documentElement.dataset.theme`.

Storage keys: `bookmark-manager:bookmarks`, `bookmark-manager:theme`.

### Validation rule

Checked on submit. A failed check does not update bookmarks. Errors render next to the fields.

| Field | Rule | Message |
| --- | --- | --- |
| Title | Required, trimmed | Title is required |
| URL | Required, `http` or `https` via `new URL()` | Please enter a valid URL |
| Description | Optional | — |
| Tags | At least one, after trim | At least one tag is required |

Tags are entered as chips (type, then Enter or comma). Compare tags case-insensitively so `React` and `react` do not become two filters.

---

## Steps

### Step 1 — Scaffold the Vite app

Create a Vite React app in this repository (JavaScript, `.jsx`, matching the brief).

- Add the folder tree above as empty placeholders where that helps.
- Keep ESLint with the React Hooks plugin so dependency arrays stay honest.
- Confirm `npm run dev` and `npm run build` succeed.
- Ignore `node_modules` and `dist`.

**Done when**

- [ ] Dev server opens a blank React page with no console errors.
- [ ] Production build completes.
- [ ] `App.jsx` is a short shell, not the future UI.

---

### Step 2 — Layout shell and design tokens

Build the static chrome before bookmark behavior: page regions, type, color, spacing.

- CSS variables for color, space, radius, and type.
- Light theme variables on `:root`. Dark theme variables on `[data-theme="dark"]` (toggle comes in Step 10; tokens exist now).
- `Layout` uses `props.children` for the main area.
- `Header`: app title, theme control placeholder.
- `Sidebar`: All Bookmarks and Archived, not wired yet.
- Main area: slots for search, filters, sort, and the list.
- `Modal` accepts `title`, `onClose`, and `children`, and renders nothing about bookmarks. It can stay closed until Step 6.
- Match the Figma file for spacing, type, and color as closely as view access allows. If Figma access is still blocked, build a clean structure and restyle when the file is shared.

**Done when**

- [ ] Desktop layout shows header, sidebar, and main region.
- [ ] Narrow viewport still shows every region (stacked or scrollable is enough for this step).
- [ ] No bookmark logic yet.

---

### Step 3 — Load seed data, then persist it

This step is read-only data. No add/edit/delete yet.

- Place the provided file at `public/data/bookmarks.json`.
- `useBookmarks` loads it with the effect pattern in the localStorage rule.
- Show `LoadingState` while `status === "loading"`.
- Show an error message with a retry path if fetch or JSON parse fails.
- After a successful first load, refresh the page and confirm the list comes from `localStorage`, not a second fetch (check the network panel).
- Render a temporary dump of titles so we can see data before the real cards exist.

**Done when**

- [ ] First visit shows a loading state, then data.
- [ ] Refresh restores the same bookmarks.
- [ ] Clearing `localStorage` and refreshing loads the seed file again.
- [ ] The JSON file is fetched, not imported.
- [ ] The loading effect cleans up its timeout.

---

### Step 4 — Bookmark list and cards

Replace the temporary dump with real components.

- `BookmarkList` maps bookmarks to `BookmarkCard`.
- `key={bookmark.id}`.
- Each card shows title, URL or domain, description, tags (`TagList`), and disabled-looking action buttons for pin, edit, archive, and delete (wired in later steps).
- Cards are presentational: `bookmark` plus callback props.

**Done when**

- [ ] Every seed bookmark renders as a card.
- [ ] React DevTools shows no missing-key warning.
- [ ] Actions do not mutate data yet.

---

### Step 5 — Search, tags, sort, and the two views

Add the derived pipeline. Still no create/update/delete.

- `SearchBar` is a controlled input. Match title and description, case-insensitive, as the user types.
- `FilterBar` lists `All` plus tags derived from bookmarks in the current view.
- `SortSelect` offers Newest, Oldest, A–Z, and Z–A (two are required; ship all four).
- Sidebar switches `view` between all and archived.
- All Bookmarks hides archived items. Archived shows only archived items.
- Pinned items stay at the top inside the active sort.
- `EmptyState` for: no search matches, empty archive, and a completely empty active list.

**Done when**

- [ ] Typing filters the list immediately.
- [ ] A tag shows only bookmarks with that tag. All clears it.
- [ ] Changing sort reorders the list, with pinned items first.
- [ ] Archived view and All Bookmarks show disjoint sets.
- [ ] Each empty case shows a message, not a blank panel.
- [ ] Filtered results are not stored in state.

---

### Step 6 — Add a bookmark

- Open `Modal` with `BookmarkForm` as `children`.
- Controlled fields: title, URL, description, tags.
- Submit validates with `validateBookmark`. Errors sit on the fields. Invalid submit leaves state unchanged.
- Valid submit appends a new object (`[...bookmarks, next]`) and closes the modal.
- The new card appears without a reload.
- Because Step 3 already persists on change, refresh keeps the new bookmark.

**Done when**

- [ ] Empty title, bad URL, and missing tag each show the required message.
- [ ] A valid bookmark appears at the correct position for the current sort and pin rule.
- [ ] Refresh keeps it.
- [ ] `preventDefault` is used. The page does not reload on submit.

---

### Step 7 — Edit a bookmark

- Edit opens the same form, prefilled from the selected bookmark.
- Save replaces that item with `map` and an object spread. Same `id`. No second bookmark.
- Cancel closes the modal and discards draft state.

**Done when**

- [ ] The form shows the current title, URL, description, and tags.
- [ ] Save updates the card in place.
- [ ] The bookmark count does not increase.
- [ ] Original objects in the previous state array are not mutated (update via copy).

---

### Step 8 — Delete with confirmation

- Delete opens `ConfirmDialog` (reusable, `children` or a message prop plus confirm/cancel callbacks).
- Confirm removes the bookmark with `filter`.
- Cancel leaves the list unchanged.
- This covers the preferred confirmation behavior and bonus item “custom confirm modal”.

**Done when**

- [ ] Delete asks first.
- [ ] Confirm removes the card with no reload.
- [ ] Refresh does not bring it back.
- [ ] `window.confirm` is not used.

---

### Step 9 — Pin, archive, and restore

- Pin and unpin update one bookmark immutably. The card shows a clear pinned state.
- Archive sets `isArchived` and removes the card from All Bookmarks.
- Archived view lists it and offers Restore.
- Restoring returns it to All Bookmarks and keeps pin, tags, and the rest of the fields.

**Done when**

- [ ] Pinned cards sit above unpinned cards in both sort modes.
- [ ] Archived cards disappear from All Bookmarks.
- [ ] Restore puts the same bookmark back.
- [ ] Empty archive and empty active list still render their empty states.

---

### Step 10 — Light and dark theme

- Header toggle flips `theme` state.
- `data-theme` switches the CSS variables from Step 2.
- Choice is saved and restored on refresh.
- First visit with no saved theme follows `prefers-color-scheme`, then any explicit toggle wins and is stored.

**Done when**

- [ ] Both themes are readable (text, cards, form, modal, empty states).
- [ ] Refresh keeps the chosen theme.
- [ ] No flash of the wrong theme on reload.

---

### Step 11 — Responsive pass

Acceptance requires a usable desktop and mobile UI.

- Desktop: persistent sidebar.
- Mobile: sidebar becomes a drawer or full-screen panel opened from the header. This is bonus item “responsive sidebar”; include it here because the acceptance bar is usability on both sizes.
- Cards, form, and filters wrap without horizontal overflow.
- Buttons and inputs stay large enough to tap.

**Done when**

- [ ] At a desktop width, sidebar and list are visible together.
- [ ] At a phone width, navigation opens and closes, and add/edit/delete/search still work.
- [ ] Light and dark still hold on both widths.

---

### Step 12 — Finish, document, deploy

- Browser tab title via `useEffect`, for example `Bookmarks (12)`, using the active-list count. Cleanup is unnecessary if the effect only sets `document.title`. This is a small bonus and a real `useEffect` use.
- README: what the app does, feature list, stack (React, Vite), and local run steps (`npm install`, `npm run dev`).
- Deploy a static build (Vercel or GitHub Pages). Set Vite `base` if GitHub Pages needs it.
- Click through the acceptance checklist at the bottom of this file on the deployed URL and locally.

**Done when**

- [ ] README matches the running app.
- [ ] Deployed URL loads, persists data in that browser, and has no React errors in the console.
- [ ] Repository contains the project, the plan, and the README.

---

## Bonus steps (after Step 12)

Only after the core checklist is green.

1. **Favorites** — `isFavorite` on the bookmark, a Favorites view, same immutable update pattern.
2. **Multiple tag filter** — `selectedTags` array. A bookmark matches if it contains every selected tag (or any selected tag; pick one rule and show it in the UI). `All` clears the array.
3. **Live clock or last change** — clock in the header with `setInterval` and a cleanup return. Last change can be derived from the newest `createdAt` / `updatedAt` without an interval.
4. **document.title** — if it was deferred from Step 12.

---

## Acceptance checklist

Use this at the end of Step 12. It mirrors the brief.

### Application

- [ ] Runs on React
- [ ] Loads with no errors
- [ ] No serious React console errors
- [ ] Usable on desktop and mobile

### Components

- [ ] UI split into logical components
- [ ] Reusable pieces (`Modal`, `EmptyState`, `TagList`, `BookmarkCard`)
- [ ] `App.jsx` is not the whole UI
- [ ] Props and callback props
- [ ] At least one `props.children` composition

### Bookmark list

- [ ] Bookmarks live in an array
- [ ] Rendered with `.map()`
- [ ] Stable unique keys
- [ ] `BookmarkCard` is its own component

### Add

- [ ] User can add a bookmark
- [ ] Form is controlled
- [ ] `onSubmit` and `preventDefault`
- [ ] New bookmark appears with no reload

### Edit

- [ ] Edit opens prefilled data
- [ ] Save updates the same bookmark
- [ ] State is not mutated in place

### Delete

- [ ] Delete removes it from state and from the UI
- [ ] Confirmation appears first

### Validation

- [ ] Title required
- [ ] URL required and must be valid
- [ ] At least one tag
- [ ] Errors are visible
- [ ] Invalid form does not submit

### Search, filter, sort

- [ ] Search matches title and description as the user types
- [ ] Empty search shows an empty state
- [ ] Tag filter works, including All
- [ ] At least two sort options reorder the list

### Archive and pin

- [ ] Archive hides the bookmark from All Bookmarks
- [ ] Archived view and Restore work
- [ ] Pin and unpin work
- [ ] Pinned bookmarks render first

### Loading, empty, effects, storage

- [ ] First load shows a loading state from `useEffect`
- [ ] Empty list, empty search, and empty archive each have a state
- [ ] Effects have intentional dependency arrays and do not loop
- [ ] Timeout and interval effects clean up
- [ ] Bookmarks and theme survive refresh

### Code quality

- [ ] Props are not reassigned
- [ ] State updates are immutable
- [ ] Component names are PascalCase
- [ ] Handlers have clear names
- [ ] No DOM APIs driving the UI
- [ ] No copy-pasted form or card variants
