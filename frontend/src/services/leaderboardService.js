import { request } from './api.js'

export async function getLeaderboard(limit = 50) {
  const result = await request(`/leaderboard?limit=${limit}`)
  return result.data.entries
}

export async function submitLeaderboardEntry(entry) {
  const result = await request('/leaderboard', {
    method: 'POST',
    body: JSON.stringify(entry),
  })
  return result.data.entry
}

export function formatSolveTime(timeMs) {
  if (!Number.isFinite(timeMs)) return '—'
  const totalSeconds = timeMs / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = (totalSeconds % 60).toFixed(2).padStart(5, '0')
  return `${minutes}:${seconds}`
}
