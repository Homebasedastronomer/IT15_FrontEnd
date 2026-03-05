import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('enrollment_auth', 'true')
        localStorage.setItem('enrollment_user', form.email || 'registrar@dollente.edu')
        navigate('/dashboard', { replace: true })
      } else {
        setError(data.message || 'Invalid credentials. Please try again.')
      }
    } catch {
      setError('Unable to connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-glow" />
      <div className="login-bokeh-layer" aria-hidden="true">
        <span className="bokeh-circle bokeh-1" />
        <span className="bokeh-circle bokeh-2" />
        <span className="bokeh-circle bokeh-3" />
        <span className="bokeh-circle bokeh-4" />
        <span className="bokeh-circle bokeh-5" />
        <span className="bokeh-circle bokeh-6" />
      </div>

      <section className="login-showcase">
        <span className="pill">Integrative Programming Prototype</span>
        <h1>Enrollment System Frontend</h1>
        <p>
          A responsive and API-ready academic control center for student registration, course
          monitoring, and data-driven enrollment planning.
        </p>

        <div className="showcase-metrics">
          <article>
            <h3>4,286</h3>
            <p>Active Students</p>
          </article>
          <article>
            <h3>97%</h3>
            <p>Enrollment Completion</p>
          </article>
          <article>
            <h3>162</h3>
            <p>Courses Offered</p>
          </article>
        </div>
      </section>

      <section className="login-panel">
        <h2>Welcome back</h2>
        <p>Sign in to access the enrollment dashboard.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email">Institutional Email</label>
          <input
            id="email"
            type="email"
            required
            placeholder="registrar@dollente.edu"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />

          {error ? <p>{error}</p> : null}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default LoginPage
