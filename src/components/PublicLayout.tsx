import { ArrowRight, LayoutDashboard, Menu, Search, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const publicNav = [
  { to: '/tests', label: 'Tests' },
  { to: '/categories', label: 'Categories' },
  { to: '/how-it-works', label: 'How it works' },
]

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate(query.trim() ? `/tests?q=${encodeURIComponent(query.trim())}` : '/tests')
    setMenuOpen(false)
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="public-shell">
      <header className="public-header">
        <div className="public-header-inner">
          <Link to="/" className="brand public-brand" onClick={closeMenu}>
            <span className="brand-mark" aria-hidden="true">T</span>
            <span>TestExchange</span>
          </Link>

          <nav className={`public-nav ${menuOpen ? 'open' : ''}`} aria-label="Community navigation">
            {publicNav.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={closeMenu}>{item.label}</NavLink>
            ))}
          </nav>

          <form className="public-search" role="search" onSubmit={search}>
            <Search size={17} aria-hidden="true" />
            <input
              aria-label="Search public tests"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tests and categories"
            />
          </form>

          <div className="public-actions">
            {user ? (
              <Link className="button button-outline" to="/console"><LayoutDashboard size={16} /> Workspace</Link>
            ) : (
              <Link className="button button-outline" to="/login" state={{ from: `${location.pathname}${location.search}` }}>Sign in</Link>
            )}
            <Link className="button button-dark public-post-button" to={user ? '/console/my-campaigns/new' : '/login'} state={user ? undefined : { from: '/console/my-campaigns/new' }}>
              Post a test <ArrowRight size={16} />
            </Link>
            <button className="icon-button public-menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="public-main"><Outlet /></main>

      <footer className="public-footer">
        <div className="public-container public-footer-inner">
          <div><span className="brand"><span className="brand-mark">T</span>TestExchange</span><p>Real software testing, rewarded fairly.</p></div>
          <nav aria-label="Footer navigation"><Link to="/tests">Browse tests</Link><Link to="/how-it-works">How it works</Link><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/acceptable-use">Acceptable use</Link><Link to="/support">Support</Link><Link to="/login">Sign in</Link></nav>
          <small>Private test materials stay between developers and accepted testers.</small>
        </div>
      </footer>
    </div>
  )
}
