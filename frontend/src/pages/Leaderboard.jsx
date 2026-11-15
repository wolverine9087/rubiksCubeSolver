import { useEffect, useState } from 'react'
import { formatSolveTime, getLeaderboard } from '../services/leaderboardService.js'

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getLeaderboard().then(result => {
      if (active) setEntries(result)
    }).catch(err => {
      if (active) setError(err.message || 'Could not load the leaderboard.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  return <main className="page-wrap leaderboard-page">
    <div className="page-heading"><div><span className="eyebrow">THE CUBE FLOW RANKINGS</span><h1>Fast hands. Clean solves.</h1><p>Only timed solves from generated random scrambles count, ranked from fastest to slowest.</p></div><span className="step-pill"><span>⏱</span> RANDOM SCRAMBLE ONLY</span></div>
    <section className="panel leaderboard-panel">
      <div className="leaderboard-heading"><div><span className="panel-kicker">RANDOM SCRAMBLE RANKINGS</span><h2>Top solves</h2></div><span className="panel-badge">TOP {entries.length || 50}</span></div>
      {error && <div className="error-toast" role="alert">{error}</div>}
      {loading ? <div className="leaderboard-empty">Loading the latest times…</div> : entries.length ? <div className="leaderboard-table-wrap"><table className="leaderboard-table"><thead><tr><th>RANK</th><th>CUBER</th><th>TIME</th><th>MOVES</th><th>DATE</th></tr></thead><tbody>{entries.map((entry, index) => <tr key={entry._id}><td><span className={`leaderboard-rank ${index < 3 ? 'top-rank' : ''}`}>{String(index + 1).padStart(2, '0')}</span></td><td><span className="leaderboard-player"><i>{entry.name.slice(0, 1).toUpperCase()}</i>{entry.name}</span></td><td className="leaderboard-time">{formatSolveTime(entry.timeMs)}</td><td>{entry.moveCount}</td><td>{new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td></tr>)}</tbody></table></div> : <div className="leaderboard-empty"><span>◇</span><strong>No times posted yet</strong><p>Be the first to solve a cube in Practice mode and claim the top spot.</p></div>}
    </section>
  </main>
}
