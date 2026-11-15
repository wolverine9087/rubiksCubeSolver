import { FACE_ORDER } from './cubeNotation.js'

export function countCubeColors(cubeState) {
  return Object.fromEntries(FACE_ORDER.map(face => [face, [...cubeState].filter(color => color === face).length]))
}

export function validateCubeColors(cubeState) {
  if (typeof cubeState !== 'string' || cubeState.length !== 54) return false
  return FACE_ORDER.every(face => countCubeColors(cubeState)[face] === 9)
}
