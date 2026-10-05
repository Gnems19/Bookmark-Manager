export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark"><img src="/design/bookmark.svg" alt="" /></span>
        <h1>Bookmark Manager</h1>
      </div>
      <nav className="sidebar-nav" aria-label="Bookmark views and tag filters">
        <ul>
          <li className="nav-item" aria-current="page"><img src="/design/home.svg" alt="" />Home</li>
          <li className="nav-item" aria-disabled="true"><img src="/design/archive.svg" alt="" />Archived</li>
        </ul>
        <div className="tag-section">
          <h2 className="sidebar-label">TAGS</h2>
          <ul>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>AI</span><span className="tag-count">1</span></label></li>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>Community</span><span className="tag-count">5</span></label></li>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>Compatibility</span><span className="tag-count">1</span></label></li>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>CSS</span><span className="tag-count">6</span></label></li>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>Design</span><span className="tag-count">1</span></label></li>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>Framework</span><span className="tag-count">2</span></label></li>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>Git</span><span className="tag-count">1</span></label></li>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>HTML</span><span className="tag-count">2</span></label></li>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>JavaScript</span><span className="tag-count">3</span></label></li>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>Layout</span><span className="tag-count">3</span></label></li>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>Learning</span><span className="tag-count">6</span></label></li>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>Performance</span><span className="tag-count">2</span></label></li>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>Practice</span><span className="tag-count">5</span></label></li>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>Reference</span><span className="tag-count">4</span></label></li>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>Tips</span><span className="tag-count">4</span></label></li>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>Tools</span><span className="tag-count">4</span></label></li>
            <li><label className="tag-option"><input type="checkbox" disabled /><span>Tutorial</span><span className="tag-count">3</span></label></li>
          </ul>
        </div>
      </nav>
    </aside>
  )
}
