import { useMemo, useState } from 'react'
import { FACE_ORDER, SOLVED_CUBE } from '../utils/cubeNotation.js'
import { countCubeColors, validateCubeColors } from '../utils/cubeValidation.js'

export default function useCube(initialState = SOLVED_CUBE) {
  const [cube, setCube] = useState(initialState)
  const [selectedColor, setSelectedColor] = useState('U')
  const counts = useMemo(() => countCubeColors(cube), [cube])

  function colorSticker(index, color = selectedColor) {
    if (index % 9 === 4 || !FACE_ORDER.includes(color)) return
    setCube(current => current.slice(0, index) + color + current.slice(index + 1))
  }

  function reset() { setCube(SOLVED_CUBE); setSelectedColor('U') }
  function clearStickers() {
    setCube(Array.from({ length: 54 }, (_, index) => index % 9 === 4 ? FACE_ORDER[Math.floor(index / 9)] : 'X').join(''))
  }

  return { cube, setCube, counts, selectedColor, setSelectedColor, colorSticker, reset, clearStickers, isColorValid: validateCubeColors(cube) }
}
