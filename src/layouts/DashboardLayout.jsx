import Sidebar from '../components/navigation/Sidebar'
import Topbar from '../components/navigation/Topbar'

function DashboardLayout({
  navItems,
  activeSection,
  onSelectSection,
  onLogout,
  title,
  subtitle,
  children,
}) {
  return (
    <div className="dashboard-shell">
      <Sidebar
        navItems={navItems}
        activeSection={activeSection}
        onSelectSection={onSelectSection}
        onLogout={onLogout}
      />
      <div className="dashboard-content-area">
        <div className="ambient-motion ambient-one" aria-hidden="true" />
        <div className="ambient-motion ambient-two" aria-hidden="true" />
        <Topbar title={title} subtitle={subtitle} />
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout