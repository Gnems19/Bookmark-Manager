import Header from "./Header.jsx"
import Sidebar from "./Sidebar.jsx"

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-body">
        <Header />
        <main className="app-main">{children}</main>
      </div>
    </div>
  )
}
