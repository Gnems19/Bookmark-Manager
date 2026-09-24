import Layout from "./components/layout/Layout.jsx"

export default function App() {
  return (
    <Layout>
      <section className="placeholder">
        <h2>Your bookmarks will show up here</h2>
        <p>
          This is the main area. The header and sidebar are already separate
          components. Next we will match the design and then render bookmark
          cards from data.
        </p>
      </section>
    </Layout>
  )
}
