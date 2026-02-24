function Filterbar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filters = [],
  actionButton,
}) {
  return (
    <div className="module-filterbar panel">
      <input
        className="module-search"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        type="text"
      />

      <div className="module-filter-controls">
        {filters.map((filter) => (
          <label key={filter.key} className="module-filter-item">
            <span>{filter.label}</span>
            <select value={filter.value} onChange={(event) => filter.onChange(event.target.value)}>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {actionButton ? <div className="module-filter-action">{actionButton}</div> : null}
    </div>
  )
}

export default Filterbar