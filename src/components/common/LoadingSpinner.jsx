function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite" aria-label={label}>
      <span className="loading-spinner-dot" />
      <span>{label}</span>
    </div>
  )
}

export default LoadingSpinner
