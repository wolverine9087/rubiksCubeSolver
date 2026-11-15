import { useAuth } from '../context/useAuth.js'

export default function Profile({ user, navigate }) {
  const { signOut } = useAuth()
  async function logout() { await signOut(); navigate('/') }
  return <main className="page-wrap profile-wrap"><div className="page-heading"><div><span className="eyebrow">YOUR ACCOUNT</span><h1>Account details.</h1><p>Your speedcubing profile.</p></div></div><section className="panel profile-card"><span className="profile-avatar">{user?.name?.[0]?.toUpperCase()||'U'}</span><div><span className="panel-kicker">CUBER</span><h2>{user?.name}</h2><span className="profile-email">{user?.email}</span></div></section><button className="logout-link" onClick={logout}>↪ Sign out of your account</button><button className="quiet-button" onClick={()=>navigate('/solver')}>Back to the solver →</button></main>
}
