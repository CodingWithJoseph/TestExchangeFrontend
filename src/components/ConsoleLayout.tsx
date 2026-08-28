import {
  BadgeDollarSign,
  ClipboardCheck,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Menu,
  Rocket,
  UserRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAccount } from '../account/AccountContext'
import { useAuth } from '../auth/AuthContext'

const navItems = [
  { to: '/console', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/console/available-tests', label: 'Available Tests', icon: FlaskConical },
  { to: '/console/my-tests', label: 'My Tests', icon: ClipboardCheck },
  { to: '/console/my-campaigns', label: 'My Campaigns', icon: Rocket },
  { to: '/console/credits', label: 'Credits', icon: BadgeDollarSign },
  { to: '/console/profile', label: 'Profile', icon: UserRound },
]

export function ConsoleLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { profile, balance } = useAccount()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = (profile?.display_name || user?.name || 'TE').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="console-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <NavLink to="/console" className="brand" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark" aria-hidden="true">T</span>
            <span>TestExchange</span>
          </NavLink>
          <button className="icon-button sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-balance">
          <span className="eyebrow">AVAILABLE BALANCE</span>
          <strong>{balance} <small>credits</small></strong>
          <NavLink to="/console/credits" onClick={() => setMenuOpen(false)}>View activity <span>→</span></NavLink>
        </div>

        <nav className="nav-list" aria-label="Console navigation">
          <span className="nav-label">WORKSPACE</span>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/console/profile" className="user-card" onClick={() => setMenuOpen(false)}>
            <span className="avatar">{initials}</span>
            <span className="user-copy">
              <strong>{profile?.display_name || user?.name}</strong>
              <small>{user?.email}</small>
            </span>
          </NavLink>
          <button className="signout-button" onClick={() => void handleSignOut()} aria-label="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {menuOpen && <button className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}

      <div className="console-main">
        <header className="mobile-header">
          <button className="icon-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation">
            <Menu size={21} />
          </button>
          <span className="brand compact"><span className="brand-mark">T</span>TestExchange</span>
          <span className="mobile-credit">{balance} cr</span>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
