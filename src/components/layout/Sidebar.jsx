const views = ["All Bookmarks", "Archived"]

export default function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Bookmark views">
      <p className="sidebar-label">Library</p>
      <ul>
        {views.map((view) => (
          <li key={view}>{view}</li>
        ))}
      </ul>
    </nav>
  )
}
