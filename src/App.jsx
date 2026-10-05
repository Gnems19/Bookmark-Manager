import Layout from "./components/layout/Layout.jsx"

export default function App() {
  return (
    <Layout>
      <section aria-labelledby="bookmarks-heading">
        <div className="content-heading">
          <h2 id="bookmarks-heading">All bookmarks</h2>
          <button className="secondary-button" type="button" disabled>
            <img src="/design/sort.svg" alt="" />Sort by
          </button>
        </div>
        <div className="bookmark-grid">
          <article className="bookmark-card" aria-labelledby="sample-title">
            <div className="card-content">
              <div className="card-heading">
                <img className="site-logo" src="/design/frontend-mentor.png" alt="" width="44" height="44" />
                <div className="site-info">
                  <h3 id="sample-title"><a href="https://www.frontendmentor.io" target="_blank" rel="noreferrer">Frontend Mentor</a></h3>
                  <a className="site-url" href="https://www.frontendmentor.io" target="_blank" rel="noreferrer">frontendmentor.io</a>
                </div>
                <button className="icon-button" type="button" aria-label="More actions for Frontend Mentor" disabled>
                  <img src="/design/more.svg" alt="" />
                </button>
              </div>
              <p className="card-description">Improve your front-end coding skills by building real projects. Solve real-world HTML, CSS and JavaScript challenges whilst working to professional designs.</p>
              <ul className="tags" aria-label="Tags">
                <li>Practice</li><li>Learning</li><li>Community</li>
              </ul>
            </div>
            <div className="card-footer">
              <div className="card-metadata">
                <span aria-label="47 visits"><img src="/design/eye.svg" alt="" />47</span>
                <span aria-label="Last visited September 23"><img src="/design/clock.svg" alt="" />23 Sep</span>
                <span aria-label="Added January 15"><img src="/design/calendar.svg" alt="" />15 Jan</span>
              </div>
              <img src="/design/pin.svg" alt="Pinned" />
            </div>
          </article>
        </div>
      </section>
    </Layout>
  )
}
