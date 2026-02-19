const sectionIcons = {
  students: '👩‍🎓',
  courses: '📚',
  enrollment: '📝',
  reports: '📊',
  settings: '⚙️',
}

function Sidebar({ navItems, activeSection, onSelectSection, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">ES</div>
        <div>
          <h1>Enrollment Suite</h1>
          <p>Academic Portal</p>
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
            <span>{sectionIcons[item.id] || '•'}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <button className="logout-btn" onClick={onLogout} type="button">
        Log out
      </button>
    </aside>
  )
}

export default Sidebar