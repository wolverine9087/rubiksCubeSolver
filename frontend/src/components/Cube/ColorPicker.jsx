import { FACE_COLORS, FACE_NAMES, FACE_ORDER } from '../../utils/cubeNotation.js'

export default function ColorPicker({ selectedColor, onSelect }) {
  return <div className="color-picker">
    <div className="palette-label"><span>SELECT A COLOR</span><span className="selected-color-label"><i style={{ '--swatch': FACE_COLORS[selectedColor] }} />{FACE_NAMES[selectedColor]} selected · drag to paint</span></div>
    <div className="palette" role="group" aria-label="Sticker colors">
      {FACE_ORDER.map(face => <button type="button" key={face} className={`swatch ${selectedColor === face ? 'selected' : ''}`} style={{ '--swatch': FACE_COLORS[face] }} onClick={() => onSelect(face)} aria-label={`Select ${FACE_NAMES[face]} sticker color`} aria-pressed={selectedColor === face} title={`Select ${FACE_NAMES[face]}`}><i />{FACE_NAMES[face]}{selectedColor === face && <span aria-hidden="true">✓</span>}</button>)}
    </div>
  </div>
}
