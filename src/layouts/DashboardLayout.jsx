import Sidebar from '../components/navigation/Sidebar'
import MobileNavBar from '../components/navigation/MobileNavBar'
import Topbar from '../components/navigation/Topbar'

function DashboardLayout({
  navItems,
  activeSection,
  onSelectSection,
  onLogout,
  userEmail,
  title,
  subtitle,
  weather,
  weatherLoading,
  children,
}) {
  return (
    <div className="dashboard-shell">
      <Sidebar
        navItems={navItems}
        activeSection={activeSection}
        onSelectSection={onSelectSection}
        onLogout={onLogout}
        userEmail={userEmail}
      />
      <div className="dashboard-content-area">
        <div className="ambient-motion ambient-one" aria-hidden="true" />
        <div className="ambient-motion ambient-two" aria-hidden="true" />

        <MobileNavBar
          navItems={navItems}
          activeSection={activeSection}
          onSelectSection={onSelectSection}
          onLogout={onLogout}
          userEmail={userEmail}
        />

        <Topbar title={title} subtitle={subtitle} weather={weather} weatherLoading={weatherLoading} />

        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout