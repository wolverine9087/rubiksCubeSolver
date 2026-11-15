import { useRef } from 'react'
import CubeFace from './CubeFace.jsx'
import { FACE_ORDER } from '../../utils/cubeNotation.js'

export default function CubeGrid({ cube, onColor }) {
  const paintingRef = useRef(false)
  return <div className="cube-editor" role="group" aria-label="Cube stickers; select a color, then click or drag across stickers to paint" onPointerUp={() => { paintingRef.current = false }} onPointerLeave={() => { paintingRef.current = false }}>
    {FACE_ORDER.map((face, index) => <CubeFace key={face} face={face} faceIndex={index} cube={cube} onColor={onColor} paintingRef={paintingRef} />)}
  </div>
}
