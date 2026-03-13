import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    // Keep a console record for debugging in development builds.
    console.error('Unhandled UI error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary-fallback" role="alert">
          <h1>Something went wrong.</h1>
          <p>Please refresh the page. If the issue continues, contact support.</p>
        </main>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
