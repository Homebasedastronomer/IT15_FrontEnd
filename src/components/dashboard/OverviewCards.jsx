function OverviewCards({ overview }) {
  return (
    <section className="overview-grid">
      {overview.map((item) => (
        <article className="overview-card" key={item.key}>
          <header>
            <span className="overview-icon">{item.icon}</span>
            <span className={`delta ${item.delta.startsWith('-') ? 'down' : 'up'}`}>
              {item.delta}
            </span>
          </header>
          <h3>{item.value}</h3>
          <p>{item.label}</p>
        </article>
      ))}
    </section>
  )
}

export default OverviewCards