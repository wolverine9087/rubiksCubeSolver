import { useState } from 'react'
import { useAuth } from '../../context/useAuth.js'

export default function AuthForm({ mode, navigate }) {
  const { signIn, signUp } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isLogin = mode === 'login'

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('')
    const values = Object.fromEntries(new FormData(event.currentTarget).entries())
    try {
      if (isLogin) await signIn(values)
      else await signUp(values)
      navigate('/solver')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return <main className="auth-wrap"><button className="back-link" onClick={() => navigate('/')}>← Back to home</button><section className="auth-card"><span className="eyebrow">✳ YOUR CUBE, FIGURED OUT</span><h1>{isLogin ? 'Welcome back.' : 'Let’s get started.'}</h1><p className="auth-copy">{isLogin ? 'Sign in to pick up where you left off.' : 'Create an account and keep every solve in one place.'}</p>
    {error && <div className="toast error-toast" role="alert">{error}</div>}
    <form className="form-stack" onSubmit={submit}>{!isLogin && <label>Your name<input name="name" placeholder="Alex Morgan" autoComplete="name" required maxLength="60"/> </label>}<label>Email address<input type="email" name="email" placeholder="you@example.com" autoComplete="email" required/></label><label>Password<input type="password" name="password" placeholder="At least 8 characters" autoComplete={isLogin ? 'current-password' : 'new-password'} minLength="8" required/></label><button className="button button-full" disabled={busy}>{busy ? 'One moment…' : isLogin ? 'Sign in' : 'Create account'} ↗</button></form>
    <p className="auth-switch">{isLogin ? 'New around here?' : 'Already have an account?'} <button onClick={() => navigate(isLogin ? '/register' : '/login')}>{isLogin ? 'Create an account' : 'Sign in'}</button></p>
  </section><p className="auth-foot">Free to use. Made for the curious.</p></main>
}
