import { useEffect, useState } from 'react'
import { AuthProvider } from './context/AuthContext.jsx'
import { useAuth } from './context/useAuth.js'
import Footer from './components/common/Footer.jsx'
import Navbar from './components/common/Navbar.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import Practice from './pages/Practice.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Register from './pages/Register.jsx'
import Solver from './pages/Solver.jsx'

function AppView() {
  const [route, setRoute] = useState(window.location.pathname)
  const { user, loading } = useAuth()
  const navigate = (path) => {
    window.history.pushState({}, '', path)
    setRoute(path)
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const authRoute = route === '/login' || route === '/register'
  let page
  if (route === '/login') page = <Login navigate={navigate} />
  else if (route === '/register') page = <Register navigate={navigate} />
  else if (route === '/solver' || route === '/solve') page = <Solver user={user} navigate={navigate} />
  else if (route === '/practice') page = <Practice />
  else if (route === '/leaderboard') page = <Leaderboard />
  else if (route === '/dashboard') page = <ProtectedRoute user={user} loading={loading} navigate={navigate}><Dashboard user={user} navigate={navigate} /></ProtectedRoute>
  else if (route === '/profile') page = <ProtectedRoute user={user} loading={loading} navigate={navigate}><Profile user={user} navigate={navigate} /></ProtectedRoute>
  else if (route === '/') page = <Home navigate={navigate} />
  else page = <main className="not-found"><span className="eyebrow">A LITTLE WRONG TURN</span><h1>This page got scrambled.</h1><button className="button" onClick={() => navigate('/')}>Back to home ↗</button></main>

  return <div className="app-shell">{!authRoute && <Navbar route={route} navigate={navigate} />}<div key={route}>{page}</div>{!authRoute && <Footer navigate={navigate} />}</div>
}

export default function App() {
  return <AuthProvider><AppView /></AuthProvider>
}
