import { FACE_COLORS, FACE_NAMES } from '../../utils/cubeNotation.js'

export default function CubeFace({ face, faceIndex, cube, onColor, paintingRef }) {
  const colors = cube.slice(faceIndex * 9, faceIndex * 9 + 9)
  const correctCount = [...colors].filter(color => color === face).length
  return <div className={`face-editor face-${face.toLowerCase()}`}>
    <div className="face-caption"><span>{FACE_NAMES[face]}</span><small>{correctCount}/9</small></div>
    <div className="face-grid">
      {Array.from({ length: 9 }, (_, cell) => {
        const index = faceIndex * 9 + cell
        const isCenter = cell === 4
        const color = cube[index]
        const colorName = FACE_NAMES[color] || 'Uncolored'
        return <button
          type="button"
          key={cell}
          className={`sticker ${isCenter ? 'center-sticker' : ''} ${!FACE_COLORS[color] ? 'sticker-empty' : ''}`}
          style={{ '--sticker': FACE_COLORS[color] || '#202936' }}
          onPointerDown={() => { paintingRef.current = true }}
          onPointerEnter={() => { if (paintingRef.current && !isCenter) onColor(index) }}
          onClick={() => onColor(index)}
          aria-label={`${FACE_NAMES[face]} square ${cell + 1}: ${isCenter ? 'fixed center' : colorName}`}
          title={isCenter ? 'Center sticker is fixed' : `${FACE_NAMES[face]} ${cell + 1}: ${colorName}`}
        />
      })}
    </div>
  </div>
}
