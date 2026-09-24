# Bookmark Manager — Implementation Plan

Saved so we can implement **one stage at a time**. The order follows the course guide. The PDF is still the grading checklist.

**Brief:** React Bookmark Manager (components, props, state, forms, lists, `useEffect`, composition).

**Guide:** Bookmark Manager Guide — four checkpoints, stages 1–26.

**Design:** [Figma — bookmark-manager-app](https://www.figma.com/design/giO3ChUIk9nSfgzW6aEVh5/bookmark-manager-app?node-id=234-4992)

**Seed data:** [Google Drive folder](https://drive.google.com/drive/folders/1Vefm1LDIQecRTE2brAc8LeZmRUZUb_Vu?usp=sharing). Used in Stage 18. Until then, a small hardcoded array is enough.

**Current repo:** README and this plan. No app scaffold yet.

---

## Main rule

Do not start the next feature while the current one is unfinished.

- If the list does not render, do not start search.
- If add does not work, do not start edit.
- If state updates are wrong, do not start `localStorage`.

A stage starts only after the previous stage runs, has been tried in the browser, and its checklist is done.

While building, keep asking:

- Which component owns this behavior?
- Which component should hold this state?
- Which component actually needs this data?
- Can this value be calculated from state we already have?

---

## Checkpoints

Do not open the next checkpoint until the current one is done.

| Checkpoint | Guide stages | Done when |
| --- | --- | --- |
| 1. Static UI, components, list | 1–4 | List is visible, components are reusable, data arrives through props, list uses `.map()` |
| 2. State and CRUD | 5–13 | Create, read, update, delete, pin, and archive work. Updates are immutable. The form is controlled and validated. |
| 3. Find, organize, modal | 14–17 | Search, one tag, sort, and pinned-first work together. Modal is reusable. Features do not fight each other. |
| 4. Load, persist, finish | 18–26 | Fetch, loading, error, `localStorage`, theme, responsive layout, refactor, and the full manual test pass. |

Submission extras from the PDF (README and a deployed URL) are Stage 27, after Checkpoint 4.

---

## How we will work

1. Implement only the next unchecked stage.
2. Exercise it in the browser: click, type, submit, refresh when that stage cares about refresh.
3. Mark the stage checklist, then move on.

Visual match to Figma matters. Correct React structure matters more. Each stage should leave the app runnable.

---

## Assignment limits

These hold for every stage.

- Functional components and JSX.
- `useState` for state. Data moves through props and callback props.
- Lists use `.map()` and `key={bookmark.id}`.
- One controlled form for add and edit (`value`, `onChange`, `onSubmit`, `preventDefault`).
- Updates copy data (`map`, `filter`, spread). No `push`, no `bookmarks[i].title = ...`, no mutated props.
- From Stage 18 on, seed data is `fetch("/data/bookmarks.json")` inside `useEffect`. Do not import the JSON as a module.
- `localStorage` stores bookmarks and theme (Stage 21 and Stage 22).
- Loading, empty, and error screens use conditional rendering.

Leave these out. They fail the brief:

- Redux, Zustand, MobX, Recoil, or any other external state library.
- React Hook Form, Formik, Yup, or Zod.
- `document.querySelector`, `innerHTML`, `classList`, or `style.display` to drive the UI.
- `window.location.reload()` after add, edit, or delete.
- `key={index}` when a bookmark has an `id`.
- One `App.jsx` that holds the whole UI and every handler.

Vite, pure helper functions, and CSS variables are fine. Custom hooks are a Stage 24 refactor, after the behavior already works in the parent. Multiple tag filtering stays a bonus.

---

## Target shape

Folders can appear as each stage needs them. This is the end state, not the Stage 1 requirement.

```
bookmark-manager/
├── public/
│   └── data/
│       └── bookmarks.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── layout/        Layout, Header, Sidebar
│   │   ├── bookmarks/     BookmarkList, BookmarkCard, TagList
│   │   ├── filters/       SearchBar, FilterBar, SortSelect
│   │   ├── form/          BookmarkForm
│   │   └── ui/            Modal, ConfirmDialog, EmptyState, LoadingState
│   └── utils/
│       ├── selectBookmarks.js
│       └── validateBookmark.js
├── package.json
└── README.md
```

`Layout` is the `props.children` wrapper for page content. `Modal` is the `props.children` wrapper for the form. `Modal` must not know what a bookmark is.

### State to keep

Names match the guide. Owners can move during the Stage 24 refactor. Until then they live in the parent that renders the list.

| State | Appears | Role |
| --- | --- | --- |
| `bookmarks` | Stage 5 | Source of truth |
| `activeView` | Stage 8 | `"all"` or `"archived"` |
| `editingBookmark` | Stage 13 | The bookmark being edited, or `null` for add |
| `isModalOpen` | Stage 14 | Modal visibility |
| `searchTerm` | Stage 15 | Controlled search |
| `selectedTag` | Stage 16 | `"all"` or one tag |
| `sortBy` | Stage 17 | `"newest"`, `"oldest"`, `"az"`, `"za"` |
| `isLoading` | Stage 19 | Initial fetch |
| `error` | Stage 19 | Initial fetch failure |
| `theme` | Stage 22 | `"light"` or `"dark"` |

Delete confirmation can use a `bookmarkToDelete` value (the bookmark, or `null`). That is the PDF’s preferred confirm step inside Stage 12.

### Do not store

Calculate these while rendering:

- `filteredBookmarks`, `searchedBookmarks`, `sortedBookmarks`
- Tag options for the filter bar
- Which empty state to show
- The domain label parsed from a URL

Pipeline, in this order:

```
bookmarks
  → active or archived
  → search
  → tag filter
  → sort
  → pinned first
  → render
```

Pinned-first is a stable split after sort: pinned items keep the sort order and move to the top. Unpinned items keep the sort order below them.

### Bookmark object

```js
{
  id: 1,
  title: "React Documentation",
  url: "https://react.dev",
  description: "Official React documentation",
  tags: ["React", "Frontend"],
  isPinned: true,
  isArchived: false,
  createdAt: "2026-09-01T10:00:00.000Z",
}
```

New bookmarks use `id: Date.now()`, `isPinned: false`, `isArchived: false`, and `createdAt: new Date().toISOString()`. Edits keep the same `id` and `createdAt`.

### localStorage rule (Stage 21)

Do not add this before CRUD and search already work.

1. On start, look in `localStorage`.
2. If saved bookmarks exist, use them.
3. If they do not, `fetch("/data/bookmarks.json")`.
4. Either way, `setBookmarks` with the result.

Write bookmarks back only after the initial load has finished, so the first empty render cannot wipe saved data. A short `setTimeout` around the load (cleared in the effect cleanup) keeps the loading state visible, which the PDF asks for.

Theme: read the saved value when `theme` state is created, then write it and set `document.documentElement.dataset.theme` in an effect.

Keys: `bookmark-manager:bookmarks`, `bookmark-manager:theme`.

### Validation (Stage 11, only after add already works)

| Field | Rule | Message |
| --- | --- | --- |
| Title | Required after trim | Title is required |
| URL | Required, `http` or `https` via `new URL()` | Please enter a valid URL |
| Description | Optional | — |
| Tags | At least one | At least one tag is required |

A failed check does not change `bookmarks`. Show the message on that field.

---

## Checkpoint 1 — Static UI, components, list

### Stage 1 — Create the React project

Create the app with Vite, JavaScript, and `.jsx`.

- Remove the Vite demo content.
- Add `src/components/`.
- Do not add fetch, forms, `localStorage`, filters, or sorting yet.

**Done when**

- [x] The app runs with no errors.
- [x] `App.jsx` renders.
- [x] `components` exists and the first layout files are in place.
- [x] The console has no serious React errors.

---

### Stage 2 — Static layout

Match the Figma structure: header, sidebar, main content, a search field, a filter area, and one bookmark card drawn in JSX.

Hardcode that sample card. Do not use state, `.map()`, fetch, or a form yet.

If Figma is still not shared with this account, build the regions from the brief and restyle when the file is viewable.

**Done when**

- [ ] Header, sidebar, and main content are separate components.
- [ ] A bookmark card’s visual structure exists.
- [ ] The layout is close to the design.
- [ ] You can name what each component is responsible for.

---

### Stage 3 — BookmarkCard

`BookmarkCard` receives one `bookmark` prop and renders title, URL, description, and tags. It contains no hardcoded bookmark of its own.

```jsx
<BookmarkCard bookmark={bookmark} />
```

**Done when**

- [ ] `BookmarkCard` is its own component.
- [ ] Data arrives only through props.
- [ ] The same component renders different bookmark objects.
- [ ] Title, URL, description, and tags show correctly.

---

### Stage 4 — Render the list

Hold a small array (still a constant, not state) and render it with `BookmarkList`.

```jsx
bookmarks.map((bookmark) => (
  <BookmarkCard key={bookmark.id} bookmark={bookmark} />
))
```

**Done when**

- [ ] Several bookmarks render.
- [ ] The list uses `.map()`.
- [ ] Each card’s key is `bookmark.id`, not the array index.
- [ ] `BookmarkList` and `BookmarkCard` are separate components.

**Checkpoint 1 gate:** list visible, reusable components, props, `.map()`.

---

## Checkpoint 2 — State and CRUD

### Stage 5 — Move bookmarks into state

```js
const [bookmarks, setBookmarks] = useState(initialBookmarks);
```

From here, every change goes through the setter.

**Done when**

- [ ] Bookmarks live in state.
- [ ] The UI renders from that state.
- [ ] Nothing uses `push` or assigns a field on an existing object.
- [ ] A state update refreshes the UI by itself.

---

### Stage 6 — Empty state

When `bookmarks` is empty, render an empty state instead of a blank panel. A reusable `EmptyState` is appropriate. Copy can be: “You don't have any bookmarks yet.”

**Done when**

- [ ] An empty array shows no cards.
- [ ] The empty state is conditional.
- [ ] The main area is not a blank gap.

---

### Stage 7 — Pin / Unpin

Each card gets a pin action. Toggle `isPinned` with `map` and a spread. Leave every other bookmark untouched. The card shows the pinned state visually.

Handler name: `handleTogglePin`.

**Done when**

- [ ] Every bookmark can be pinned and unpinned.
- [ ] Only that bookmark’s object changes.
- [ ] The update is immutable.
- [ ] The UI shows which cards are pinned.

Pinned items do not have to jump to the top yet. That is Stage 17.

---

### Stage 8 — Archive / Restore

Add `activeView` with two sidebar entries: All Bookmarks and Archived.

- Archive sets `isArchived: true`. Those cards leave All Bookmarks.
- Archived shows only archived bookmarks and can restore them.
- Restore sets `isArchived: false` and keeps the other fields.

An empty archived view needs its own empty message (refined again in Stage 23).

**Done when**

- [ ] Archive removes the card from All Bookmarks.
- [ ] Archived shows only archived bookmarks.
- [ ] Restore puts the same bookmark back on the main list.

---

### Stage 9 — Add form, on the page

Build `BookmarkForm` in the page first. Modal comes in Stage 14, after add and edit already work.

Fields: title, URL, description, tags. All controlled. Submit with `onSubmit` and `preventDefault`. A valid submit appends a bookmark and the new card appears with no reload.

**Done when**

- [ ] Every input is tied to state.
- [ ] `onChange` updates that state.
- [ ] `onSubmit` and `preventDefault` run.
- [ ] The new bookmark appears without a reload.

---

### Stage 10 — Build the new object

```js
const newBookmark = {
  id: Date.now(),
  title: form.title.trim(),
  url: form.url.trim(),
  description: form.description.trim(),
  tags: form.tags,
  isPinned: false,
  isArchived: false,
  createdAt: new Date().toISOString(),
};
```

Add it with a new array: `[...bookmarks, newBookmark]`.

**Done when**

- [ ] The id is unique.
- [ ] `isPinned` and `isArchived` start as `false`.
- [ ] The object is appended immutably.

---

### Stage 11 — Validation

Add validation only after add already succeeds. Use the rules in the validation table. An invalid form does not update `bookmarks`, and the message shows on the field.

**Done when**

- [ ] An empty title does not submit.
- [ ] An invalid URL does not submit.
- [ ] A form with no tags does not submit.
- [ ] Each case shows its message.
- [ ] Valid data still adds a bookmark.

---

### Stage 12 — Delete

`handleDeleteBookmark` removes by id with `filter`. It does not use the array index or reload the page.

The PDF also wants a confirmation before delete. After the filter delete works, ask with a reusable `ConfirmDialog` (message plus confirm and cancel callbacks). Do not use `window.confirm`. This also covers the custom-confirm bonus.

**Done when**

- [ ] The chosen bookmark is removed and the others stay.
- [ ] Removal uses `filter` on `id`.
- [ ] The UI updates with no reload.
- [ ] Confirm deletes, cancel leaves the list as it was.

---

### Stage 13 — Edit

Edit stores the chosen bookmark in `editingBookmark` and fills the same `BookmarkForm`. Save replaces that id with `map` and a spread. It must not create a second bookmark.

Handler name: `handleEditBookmark`.

**Done when**

- [ ] Edit shows the current title, URL, description, and tags.
- [ ] Save updates that bookmark.
- [ ] The list length stays the same.
- [ ] Add and edit share one form.

**Checkpoint 2 gate:** CRUD works, updates are immutable, the form is controlled, validation blocks bad submits.

---

## Checkpoint 3 — Find, organize, modal

### Stage 14 — Move the form into a Modal

Do this only after add and edit work on the page.

```jsx
<Modal>
  <BookmarkForm />
</Modal>
```

`isModalOpen` controls visibility. Close is a callback. `Modal` only provides the frame and `children`. The same modal must be able to host other content later (the confirm dialog can use it too).

**Done when**

- [ ] Add and edit open inside the modal.
- [ ] Open and close go through state.
- [ ] `Modal` uses `props.children`.
- [ ] `Modal` is not tied to bookmark fields.

---

### Stage 15 — Search

```js
const [searchTerm, setSearchTerm] = useState("");
```

Match title and description as the user types. Compare case-insensitively. Do not store the search results in state.

If nothing matches, show an empty state. That message is different from “You don't have any bookmarks yet.”

**Done when**

- [ ] The search input is controlled.
- [ ] Results update while typing.
- [ ] Title and description both match.
- [ ] No matches shows an empty state.

---

### Stage 16 — Filter by one tag

`selectedTag` is `"all"` or one tag. Options are `All` plus tags derived from the current view. One tag at a time. Multiple tags stay a bonus.

Search and the tag filter both apply. A bookmark must pass both.

**Done when**

- [ ] The selected tag is state.
- [ ] Only bookmarks with that tag show.
- [ ] All shows every bookmark in the current view.
- [ ] Search and the tag filter work together.

---

### Stage 17 — Sort, then pinned first

The PDF requires at least two sorts. Ship Newest, Oldest, A–Z, and Z–A as `sortBy`.

Then apply the pipeline order: view, search, tag, sort, pinned first. Pin and unpin still only toggle `isPinned`. The list order is derived.

**Done when**

- [ ] Changing sort reorders the list.
- [ ] Pinned bookmarks render first.
- [ ] Unpinned bookmarks stay below them.
- [ ] Pin, search, filter, and sort still agree after each action.

**Checkpoint 3 gate:** search, tag filter, sort, and pinned-first all work, and the modal is reusable.

---

## Checkpoint 4 — Load, persist, finish

### Stage 18 — Move seed data into JSON

Put the starting bookmarks in `public/data/bookmarks.json`. Remove any direct JavaScript import of that data. The file is valid JSON, and every object has the bookmark fields.

The in-memory array can remain as a temporary fallback until Stage 19 fetches the file.

**Done when**

- [ ] Seed data lives in `public/data/bookmarks.json`.
- [ ] The app does not import that file as a module.
- [ ] The JSON is valid and every bookmark has the required fields.

---

### Stage 19 — Fetch on mount

```js
useEffect(() => {
  // fetch("/data/bookmarks.json")
}, []);
```

Fetch once, after mount, not in the component body. Store the result with `setBookmarks`. Track `isLoading` and `error`.

**Done when**

- [ ] Data loads with `fetch`.
- [ ] The request runs from `useEffect` after mount.
- [ ] It runs once on the initial load.
- [ ] The result is stored in state.

---

### Stage 20 — Loading, success, and error

While `isLoading` is true, show “Loading bookmarks...” or `LoadingState`. On failure, show “Something went wrong while loading bookmarks.” On success, show the list. Loading disappears after success or failure.

Use a short timeout in the load effect, cleared on cleanup, so the loading state is actually visible. The PDF asks for that.

**Done when**

- [ ] Loading shows during the fetch.
- [ ] Success shows the list.
- [ ] A failed fetch shows the error message.
- [ ] Loading is gone after either result.

---

### Stage 21 — localStorage

`bookmarks.json` is only the seed.

```
App starts
  → check localStorage
      → saved data exists → use it
      → nothing saved → fetch JSON
  → setBookmarks
```

Follow the localStorage rule above so a refresh restores added, edited, deleted, pinned, and archived bookmarks.

**Done when**

- [ ] Startup checks `localStorage`.
- [ ] Saved data is used when it exists.
- [ ] Missing data falls back to the JSON fetch.
- [ ] The loaded array is what React renders.
- [ ] Refresh restores the previous bookmarks.

---

### Stage 22 — Theme

Light and dark are `theme` state. Switching updates the CSS variables through `data-theme` and saves the choice. Refresh restores it.

If nothing is saved yet, follow `prefers-color-scheme`, then let an explicit toggle overwrite that and persist.

**Done when**

- [ ] Light mode and dark mode both work.
- [ ] Theme is state.
- [ ] The choice is in `localStorage`.
- [ ] Refresh keeps it.
- [ ] Reload does not flash the wrong theme.

---

### Stage 23 — All UI states together

Walk every state and give it a real screen:

- Initial loading
- Fetch error
- No bookmarks
- No search results
- No archived bookmarks
- Modal open and closed
- Validation errors

**Done when**

- [ ] Each of those has its own UI.
- [ ] The user never hits a blank, unexplained screen.
- [ ] Switching between them is conditional and easy to follow.

---

### Stage 24 — Refactor

No new features. Split anything that has piled into `App.jsx`. One form only. Drop state that can be derived. Rename handlers so they say what they do: `handleDeleteBookmark`, `handleEditBookmark`, `handleTogglePin`.

**Done when**

- [ ] `App.jsx` is not the whole application.
- [ ] Reusable pieces are extracted.
- [ ] Add and edit are not two copies of the form.
- [ ] Handler names are specific.
- [ ] State holds only source data, not derived lists.

---

### Stage 25 — Responsive layout

Do this after the features work. Check desktop, tablet, and a phone width.

- Desktop: sidebar stays visible.
- Smaller widths: sidebar opens as a drawer or panel from the header, then closes.
- Content is not clipped. Buttons and the form stay usable.
- Bring spacing and type closer to Figma on each width.

**Done when**

- [ ] The app is usable at desktop, tablet, and mobile widths.
- [ ] Nothing important is cut off.
- [ ] Buttons and the form can be used.
- [ ] Mobile navigation opens and closes.
- [ ] The layout is close to the design.

---

### Stage 26 — Final manual test

```
Open app
  → initial data loads
  → add
  → edit
  → pin
  → archive
  → restore
  → search
  → filter
  → sort
  → delete
  → refresh
  → bookmarks and theme are still there
```

Also try an invalid form, an empty search, and an empty archive.

**Done when**

- [ ] Add, edit, delete, pin, archive, restore, search, filter, and sort work.
- [ ] Validation blocks bad submits.
- [ ] Fetch, loading, and error behave.
- [ ] Bookmarks and theme survive refresh.
- [ ] The console has no serious errors.
- [ ] Refresh does not break a feature.

**Checkpoint 4 gate:** load, persistence, theme, responsive layout, refactor, and the manual test are done.

---

### Stage 27 — README and deploy

The PDF submission needs a working deploy and a README. The guide’s stages stop at testing.

- README: what the app does, the feature list, the stack (React, Vite), and how to run it (`npm install`, `npm run dev`).
- Deploy the static build (Vercel or GitHub Pages). Set Vite `base` if GitHub Pages needs it.
- Optional small bonus while touching effects: set `document.title` from the visible count, for example `Bookmarks (12)`.

**Done when**

- [ ] README matches the app.
- [ ] The deployed URL loads, persists data in that browser, and has no serious console errors.
- [ ] The acceptance checklist at the bottom of this file is checked locally and on the deploy.

---

## Bonus (after Stage 27)

1. **Favorites** — `isFavorite` plus a Favorites view, same immutable update.
2. **Multiple tags** — only after single-tag filtering works. Pick one rule (every selected tag, or any selected tag) and show it in the UI. All clears the selection.
3. **Live clock** — `setInterval` in the header with a cleanup return. A “last change” label can be derived from timestamps with no interval.
4. **document.title** — if it was not done in Stage 27.

Custom confirm is already part of Stage 12. Responsive sidebar is already part of Stage 25.

---

## Acceptance checklist

Use this at the end of Stage 27. It mirrors the PDF.

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
