import { useEffect, useState } from 'react'
import { useAuth } from '../../context/useAuth.js'
import { checkBackendHealth } from '../../services/healthService.js'

export default function Navbar({ route, navigate }) {
  const { user, signOut } = useAuth()
  const [apiStatus, setApiStatus] = useState('checking')
  useEffect(() => {
    let active = true
    const check = () => checkBackendHealth().then(() => active && setApiStatus('online')).catch(() => active && setApiStatus('offline'))
    check()
    const timer = window.setInterval(check, 30000)
    return () => { active = false; window.clearInterval(timer) }
  }, [])
  const logout = async () => { await signOut(); navigate('/') }
  return <header className="topbar">
    <a className="brand" href="/" onClick={event => { event.preventDefault(); navigate('/') }}><span className="brand-icon">◇</span><span>cubeflow<span className="brand-dot">.</span></span></a>
    <nav className="main-nav" aria-label="Main navigation"><a className={route === '/' ? 'active' : ''} href="/" onClick={event => { event.preventDefault(); navigate('/') }}>Home</a><a className={route === '/solver' ? 'active' : ''} href="/solver" onClick={event => { event.preventDefault(); navigate('/solver') }}>Solver</a><a className={route === '/practice' ? 'active' : ''} href="/practice" onClick={event => { event.preventDefault(); navigate('/practice') }}>Practice</a><a className={route === '/leaderboard' ? 'active leaderboard-nav' : 'leaderboard-nav'} href="/leaderboard" onClick={event => { event.preventDefault(); navigate('/leaderboard') }}><span className="leaderboard-nav-full">Leaderboard</span><span className="leaderboard-nav-short">Ranks</span></a></nav>
    <div className="top-actions"><span className={`connection-status ${apiStatus}`} title="Backend API status"><i/>{apiStatus==='online'?'API connected':apiStatus==='offline'?'API unavailable':'Connecting'}</span>{user ? <><button className="user-chip" onClick={() => navigate('/profile')}><span className="avatar">{user.name?.[0]?.toUpperCase() || 'U'}</span><span>{user.name?.split(' ')[0] || 'Account'}</span></button><button className="icon-button" onClick={logout} title="Sign out" aria-label="Sign out">↪</button></> : <><button className="text-button" onClick={() => navigate('/login')}>Log in</button><button className="button button-small" onClick={() => navigate('/register')}>Create account ↗</button></>}</div>
  </header>
}
