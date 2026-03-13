import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const credentials = {
        email: form.email,
        password: form.password,
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, credentials)

      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('enrollment_auth', 'true')
        localStorage.setItem('enrollment_user', response.data?.user?.email ?? credentials.email)
        navigate('/dashboard')
      } else {
        setError('Login response did not include a token.')
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const apiMessage =
          typeof err.response?.data?.message === 'string' ? err.response.data.message : null

        if (status === 401) {
          setError('Invalid credentials. Please try again.')
        } else if (apiMessage) {
          setError(apiMessage)
        } else if (err.code === 'ERR_NETWORK') {
          setError('Cannot reach the API server. Check VITE_API_URL and backend CORS.')
        } else {
          setError(`Login failed (status: ${status ?? 'no response'}).`)
        }
      } else {
        setError('Unexpected error during login. Please try again.')
      }
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
        <h1>UMroll Enrollment System</h1>
        <p>
          Manage student registration, class scheduling, and enrollment records in one secure
          platform built for university registrar operations.
        </p>

        <div className="showcase-metrics">
          <article>
            <h3>12,480</h3>
            <p>Enrolled Students</p>
          </article>
          <article>
            <h3>342</h3>
            <p>Open Course Sections</p>
          </article>
          <article>
            <h3>96.4%</h3>
            <p>On-Time Enrollment Rate</p>
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
          <div className="password-input-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 3l18 18" />
                  <path d="M10.58 10.58a2 2 0 102.83 2.83" />
                  <path d="M9.88 5.09A10.94 10.94 0 0112 4c5 0 9.27 3.11 11 8-1 2.83-3.06 5.08-5.74 6.31" />
                  <path d="M6.61 6.61A12.24 12.24 0 001 12c1.73 4.89 6 8 11 8a10.94 10.94 0 006.91-2.42" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M1 12c1.73-4.89 6-8 11-8s9.27 3.11 11 8c-1.73 4.89-6 8-11 8S2.73 16.89 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {error ? <p>{error}</p> : null}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default Login
