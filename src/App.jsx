import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownUp, ArrowRight, Building2, Check, ChevronDown, CircleHelp,
  Command, Globe2, LayoutGrid, Mail, MapPin, Moon, Search, Sun,
  UsersRound, X, RefreshCw, BriefcaseBusiness, Phone, ExternalLink,
} from 'lucide-react'

const API_URL = 'https://jsonplaceholder.typicode.com/users'

const avatarColors = [
  'from-violet-500 to-indigo-500', 'from-amber-400 to-orange-500',
  'from-cyan-500 to-blue-500', 'from-rose-500 to-pink-500',
  'from-emerald-500 to-teal-500', 'from-fuchsia-500 to-purple-500',
]

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

function Avatar({ user, size = 'normal' }) {
  return (
    <div className={`avatar bg-gradient-to-br ${avatarColors[(user.id - 1) % avatarColors.length]} ${size === 'large' ? 'avatar-large' : ''}`}>
      {initials(user.name)}
    </div>
  )
}

function StatCard({ label, value, note, icon: Icon, accent }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${accent}`}><Icon size={19} strokeWidth={1.8} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note"><span className="status-dot" />{note}</div>
    </article>
  )
}

function UserCard({ user, onClick, index }) {
  return (
    <button className="user-card text-left" onClick={onClick} style={{ animationDelay: `${index * 35}ms` }}>
      <div className="user-card-top">
        <Avatar user={user} />
        <span className="card-arrow"><ArrowRight size={16} /></span>
      </div>
      <div className="user-name">{user.name}</div>
      <div className="user-handle">@{user.username.toLowerCase()}</div>
      <div className="user-card-divider" />
      <div className="user-detail-line"><Mail size={14} /><span>{user.email}</span></div>
      <div className="user-detail-line"><Building2 size={14} /><span>{user.company.name}</span></div>
      <div className="user-card-bottom">
        <span className="location-tag"><MapPin size={12} />{user.address.city}</span>
        <span className="open-profile">Profile <ArrowRight size={13} /></span>
      </div>
    </button>
  )
}

function UserModal({ user, onClose }) {
  useEffect(() => {
    if (!user) return
    const onKey = event => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [user, onClose])

  if (!user) return null
  return (
    <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <button className="modal-close icon-button" onClick={onClose} aria-label="Close profile"><X size={18} /></button>
        <div className="modal-cover">
          <div className="cover-orb cover-orb-one" /><div className="cover-orb cover-orb-two" />
          <span className="profile-kicker">PEOPLE DIRECTORY <span> / </span> PROFILE</span>
        </div>
        <div className="modal-content">
          <div className="modal-identity">
            <Avatar user={user} size="large" />
            <div><h2 id="profile-title">{user.name}</h2><p>@{user.username.toLowerCase()} · Member profile</p></div>
          </div>
          <div className="profile-section">
            <div className="section-eyebrow">CONTACT INFORMATION</div>
            <div className="profile-info-grid">
              <div className="info-tile"><Mail size={16} /><div><span>Email address</span><strong>{user.email}</strong></div></div>
              <div className="info-tile"><Phone size={16} /><div><span>Phone number</span><strong>{user.phone}</strong></div></div>
              <div className="info-tile"><Globe2 size={16} /><div><span>Website</span><strong>{user.website}</strong></div></div>
              <div className="info-tile"><MapPin size={16} /><div><span>Address</span><strong>{user.address.street}, {user.address.suite}</strong><small>{user.address.city}, {user.address.zipcode}</small></div></div>
            </div>
          </div>
          <div className="profile-section company-section">
            <div className="section-eyebrow">COMPANY & ROLE</div>
            <div className="company-panel">
              <div className="company-logo"><Building2 size={20} /></div>
              <div className="company-copy"><strong>{user.company.name}</strong><span>{user.company.catchPhrase}</span><small>{user.company.bs}</small></div>
            </div>
          </div>
          <div className="modal-footer"><span><span className="status-dot" /> User record synced</span><button onClick={onClose}>Done <Check size={15} /></button></div>
        </div>
      </section>
    </div>
  )
}

export default function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('people-theme') || 'light')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('people-theme', theme)
  }, [theme])

  const fetchUsers = async (signal) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_URL, { signal })
      if (!response.ok) throw new Error('The directory could not be reached.')
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      if (err.name !== 'AbortError') setError('We couldn’t load the directory. Please check your connection and try again.')
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchUsers(controller.signal)
    return () => controller.abort()
  }, [])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return users
      .filter(user => `${user.name} ${user.email}`.toLowerCase().includes(query))
      .sort((a, b) => sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))
  }, [users, search, sortOrder])

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const safePage = Math.min(currentPage, pageCount)
  const paginatedUsers = filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, sortOrder])

  const toggleTheme = () => setTheme(current => current === 'light' ? 'dark' : 'light')

  return (
    <div className="app-shell">
      <header className="topbar">
        <a href="#" className="brand" aria-label="People home">
          <span className="brand-mark"><UsersRound size={18} strokeWidth={2.5} /></span>
          <span>people<span className="brand-period">.</span></span>
        </a>
        <div className="topbar-center"><span className="live-indicator" /> PEOPLE DIRECTORY</div>
        <div className="topbar-actions">
          <span className="topbar-date">Your workspace</span>
          <button className="icon-button theme-button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="intro-row">
          <div>
            <h1>User List</h1>
            <p className="intro-copy">Search, filter, and sort users. Select one to see its details and location on the map.</p>
          </div>
          <div className="intro-meta"><span className="meta-label">DIRECTORY STATUS</span><span className="meta-value"><span className="status-dot" /> Live data <span className="meta-divider">·</span> JSONPlaceholder API</span></div>
        </div>

        <section className="stats-grid" aria-label="Directory summary">
          <StatCard label="TOTAL PEOPLE" value={loading ? '—' : String(users.length).padStart(2, '0')} note="Across your directory" icon={UsersRound} accent="stat-violet" />
          <StatCard label="COMPANIES" value={loading ? '—' : String(new Set(users.map(user => user.company.name)).size).padStart(2, '0')} note="Distinct organizations" icon={Building2} accent="stat-blue" />
          <StatCard label="CITIES" value={loading ? '—' : String(new Set(users.map(user => user.address.city)).size).padStart(2, '0')} note="Places represented" icon={Globe2} accent="stat-orange" />
        </section>

        <section className="directory-section">
          <div className="directory-heading">
            <div><div className="section-eyebrow">THE DIRECTORY</div><h2>People <span className="count-pill">{loading ? '…' : filteredUsers.length}</span></h2></div>
            <div className="directory-tools">
              <label className="search-field"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name or email..." aria-label="Search users by name or email" /><kbd>⌘ K</kbd></label>
              <button className="sort-button" onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}><ArrowDownUp size={15} /> <span>Name</span><span className="sort-direction">{sortOrder === 'asc' ? 'A–Z' : 'Z–A'}</span></button>
            </div>
          </div>

          {loading ? (
            <div className="state-panel"><div className="loader-ring" /><h3>Finding your people</h3><p>Gathering the latest directory data…</p><div className="skeleton-grid">{[1,2,3,4].map(n => <div className="skeleton-card" key={n}><div className="skeleton-line short" /><div className="skeleton-line" /><div className="skeleton-line medium" /></div>)}</div></div>
          ) : error ? (
            <div className="state-panel"><div className="state-icon error-icon"><CircleHelp size={22} /></div><h3>Something went off track</h3><p>{error}</p><button className="retry-button" onClick={() => { const controller = new AbortController(); fetchUsers(controller.signal) }}><RefreshCw size={15} /> Try again</button></div>
          ) : filteredUsers.length ? (
            <div className="user-grid">{paginatedUsers.map((user, index) => <UserCard key={user.id} user={user} index={index} onClick={() => setSelectedUser(user)} />)}</div>
          ) : (
            <div className="state-panel empty-panel"><div className="state-icon"><Search size={22} /></div><h3>No people found</h3><p>Try another name or email address.</p><button className="retry-button" onClick={() => setSearch('')}>Clear search <X size={15} /></button></div>
          )}
          {!loading && !error && <div className="directory-footer"><span>Showing <strong>{filteredUsers.length ? (safePage - 1) * pageSize + 1 : 0}–{Math.min(safePage * pageSize, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> filtered people <span className="directory-total">({users.length} total)</span></span><div className="pagination"><button className="page-button" onClick={() => setCurrentPage(page => Math.max(1, page - 1))} disabled={safePage === 1} aria-label="Previous page">Previous</button><span className="page-indicator">Page <strong>{safePage}</strong> of <strong>{pageCount}</strong></span><button className="page-button" onClick={() => setCurrentPage(page => Math.min(pageCount, page + 1))} disabled={safePage === pageCount} aria-label="Next page">Next</button></div></div>}
        </section>
      </main>
      <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  )
}