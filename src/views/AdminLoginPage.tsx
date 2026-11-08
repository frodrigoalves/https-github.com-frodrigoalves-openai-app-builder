import { Link, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { demoSessionKey } from '../demoSession'

const demoEmail = 'demo@steinplatte.site'
const demoPassword = 'Steinplatte!Demo26'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse ein.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
      return
    }
    if (!password) {
      setError('Bitte geben Sie ein Passwort ein.')
      return
    }
    if (email.trim().toLocaleLowerCase('de-AT') !== demoEmail || password !== demoPassword) {
      setError('Die eingegebenen Zugangsdaten sind nicht korrekt.')
      return
    }
    window.sessionStorage.setItem(demoSessionKey, 'active')
    setPassword('')
    setError('')
    void navigate({ to: '/verwaltung', replace: true })
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <Link className="login-brand" to="/" aria-label="STEINPLATTE, Startseite">
          <span>STEINPLATTE</span>
          <small>Mineralien &amp; Edelsteine</small>
        </Link>
        <div className="login-heading">
          <span className="eyebrow">Verwaltungsbereich</span>
          <h1 id="login-title">Verwaltung</h1>
          <p>Melden Sie sich an, um Produkte zu verwalten.</p>
        </div>
        <form className="login-form" onSubmit={submit} noValidate>
          <label>
            E-Mail-Adresse
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(error && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))}
              aria-describedby={error ? 'login-error' : undefined}
              value={email}
              onChange={(event) => { setEmail(event.target.value); setError('') }}
            />
          </label>
          <label>
            Passwort
            <span className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                required
                aria-describedby={error ? 'login-error' : undefined}
                value={password}
                onChange={(event) => { setPassword(event.target.value); setError('') }}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          {error && <p className="login-error" id="login-error" role="alert">{error}</p>}
          <button className="button button-dark login-submit" type="submit">Anmelden</button>
        </form>
        <p className="login-demo-notice">Demo-Zugang. Diese Prüfung erfolgt nur im Browser und ist keine sichere Authentifizierung.</p>
        <Link className="login-back-link" to="/">Zurück zum Shop</Link>
      </section>
    </main>
  )
}
