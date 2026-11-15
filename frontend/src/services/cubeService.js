import { request } from './api.js'

export async function solveCube(cubeState) {
  const result = await request('/cube/solve', {
    method: 'POST',
    body: JSON.stringify({ cubeState }),
  })
  return result.data
}
