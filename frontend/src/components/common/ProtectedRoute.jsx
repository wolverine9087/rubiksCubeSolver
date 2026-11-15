export default function ProtectedRoute({ user, loading, navigate, children }) {
  if (loading) return <main className="page-wrap"><p className="helper-text">Checking your account…</p></main>
  if (!user) return <main className="auth-wrap"><section className="auth-card"><span className="eyebrow">YOUR ACCOUNT</span><h1>Sign in to continue.</h1><p className="auth-copy">Sign in to see your account details.</p><button className="button button-full" onClick={() => navigate('/login')}>Sign in ↗</button></section></main>
  return children
}
