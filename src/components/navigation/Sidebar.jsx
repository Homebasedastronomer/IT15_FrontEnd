function NavIcon({ section }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  if (section === 'dashboard') {
    return (
      <svg {...common}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V21h13V9.5" />
      </svg>
    )
  }

  if (section === 'programs') {
    return (
      <svg {...common}>
        <path d="M3 6.5 12 3l9 3.5-9 3.5-9-3.5Z" />
        <path d="M6.5 10.2V15c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4.8" />
      </svg>
    )
  }

  if (section === 'subjects') {
    return (
      <svg {...common}>
        <path d="M5 4.5h10a3 3 0 0 1 3 3V20H8a3 3 0 0 0-3 3Z" />
        <path d="M8 4.5v18" />
      </svg>
    )
  }

  if (section === 'students') {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <path d="M16 11.5a2.5 2.5 0 1 0 0-5" />
        <path d="M18 19a4 4 0 0 0-2.5-3.7" />
      </svg>
    )
  }

  if (section === 'enrollment') {
    return (
      <svg {...common}>
        <rect x="4" y="3.5" width="16" height="17" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    )
  }

  if (section === 'reports') {
    return (
      <svg {...common}>
        <path d="M4 20V8" />
        <path d="M10 20V4" />
        <path d="M16 20v-7" />
        <path d="M22 20v-11" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2.2M19.8 12H22M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" />
    </svg>
  )
}

function Sidebar({ navItems, activeSection, onSelectSection, onLogout, userEmail }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark" aria-hidden="true">
          <img src="/umtc-logo.png" alt="UM Tagum College logo" className="brand-mark-image" />
        </div>
        <div>
          <h1>UMroll Enrollment System</h1>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-link ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSelectSection(item.id)}
            type="button"
          >
            <span className="nav-icon">
              <NavIcon section={item.id} />
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-user">
        <p>Signed in as</p>
        <strong>{userEmail}</strong>
      </div>

      <button className="logout-btn" onClick={onLogout} type="button">
        Log out
      </button>
    </aside>
  )
}

export default Sidebar