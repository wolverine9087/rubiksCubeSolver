export const FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B']
export const FACE_NAMES = { U: 'Up', R: 'Right', F: 'Front', D: 'Down', L: 'Left', B: 'Back' }
export const FACE_COLORS = { U: '#f8fafc', R: '#ef5350', F: '#38bdf8', D: '#facc15', L: '#fb923c', B: '#4ade80' }
export const SOLVED_CUBE = FACE_ORDER.map(face => face.repeat(9)).join('')

export function formatMove(move) {
  const direction = move.endsWith("'") ? 'counter-clockwise' : move.endsWith('2') ? 'twice' : 'clockwise'
  return `${FACE_NAMES[move[0]] || move[0]} face ${direction}`
}
