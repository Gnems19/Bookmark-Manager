export default function Header() {
  return (
    <header className="header">
      <label className="search-field">
        <span className="sr-only">Search bookmarks</span>
        <img src="/design/search.svg" alt="" />
        <input type="search" placeholder="Search by title..." disabled />
      </label>
      <div className="header-actions">
        <button className="primary-button" type="button" disabled>
          <img src="/design/plus.svg" alt="" />Add Bookmark
        </button>
        <button className="avatar-button" type="button" aria-label="Profile" disabled>
          <img src="/design/avatar.png" alt="" width="40" height="40" />
        </button>
      </div>
    </header>
  )
}
