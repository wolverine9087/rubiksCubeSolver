import { useEffect, useRef, useState } from 'react'
import { FACE_COLORS, FACE_ORDER } from '../../utils/cubeNotation.js'

const SPACING = 1.035
const TURN_MS = 330
const FACE_INFO = {
  U: { normal: [0, 1, 0], index: (x, y, z) => (z + 1) * 3 + (x + 1) },
  R: { normal: [1, 0, 0], index: (x, y, z) => (1 - y) * 3 + (1 - z) },
  F: { normal: [0, 0, 1], index: (x, y, _z) => (1 - y) * 3 + (x + 1) },
  D: { normal: [0, -1, 0], index: (x, y, z) => (1 - z) * 3 + (x + 1) },
  L: { normal: [-1, 0, 0], index: (_x, y, z) => (1 - y) * 3 + (z + 1) },
  B: { normal: [0, 0, -1], index: (x, y, _z) => (1 - y) * 3 + (1 - x) },
}

function addSticker(THREE, cubie, face, color) {
  const [nx, ny, nz] = FACE_INFO[face].normal
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(nx ? 0.045 : 0.78, ny ? 0.045 : 0.78, nz ? 0.045 : 0.78),
    new THREE.MeshStandardMaterial({ color, roughness: 0.36, metalness: 0.02 }),
  )
  mesh.position.set(nx * 0.5, ny * 0.5, nz * 0.5)
  cubie.add(mesh)
}

function disposeCube(group) {
  const geometries = new Set()
  const materials = new Set()
  group.traverse(object => {
    if (object.geometry) geometries.add(object.geometry)
    if (Array.isArray(object.material)) object.material.forEach(material => materials.add(material))
    else if (object.material) materials.add(object.material)
  })
  for (const child of [...group.children]) group.remove(child)
  geometries.forEach(geometry => geometry.dispose())
  materials.forEach(material => material.dispose())
}

function makeCube(THREE, group, state) {
  disposeCube(group)
  const bodyGeometry = new THREE.BoxGeometry(0.97, 0.97, 0.97)
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: '#161923', roughness: 0.55 })

  for (let x = -1; x <= 1; x += 1) {
    for (let y = -1; y <= 1; y += 1) {
      for (let z = -1; z <= 1; z += 1) {
        if (x === 0 && y === 0 && z === 0) continue
        const cubie = new THREE.Group()
        cubie.position.set(x * SPACING, y * SPACING, z * SPACING)
        cubie.userData.isCubie = true
        cubie.add(new THREE.Mesh(bodyGeometry, bodyMaterial))

        for (const face of FACE_ORDER) {
          const [nx, ny, nz] = FACE_INFO[face].normal
          if (x * nx + y * ny + z * nz !== 1) continue
          const facelet = FACE_ORDER.indexOf(face) * 9 + FACE_INFO[face].index(x, y, z)
          addSticker(THREE, cubie, face, FACE_COLORS[state[facelet]] || '#252a35')
        }
        group.add(cubie)
      }
    }
  }
}

function inverseMove(move) {
  if (move.endsWith('2')) return move
  return move.endsWith("'") ? move[0] : `${move[0]}'`
}

function enqueueBetween(queue, moves, from, to) {
  if (to > from) {
    for (let index = from; index < to; index += 1) queue.push(moves[index])
  } else {
    for (let index = from - 1; index >= to; index -= 1) queue.push(inverseMove(moves[index]))
  }
}

function animateTurn(THREE, group, move, isCurrent, done, requestFrameRef) {
  const face = move[0]
  const [nx, ny, nz] = FACE_INFO[face].normal
  const axis = nx ? 'x' : ny ? 'y' : 'z'
  const sign = nx || ny || nz
  const turns = move.endsWith('2') ? 2 : 1
  const angle = (move.endsWith("'") ? 1 : -1) * sign * Math.PI * turns / 2
  const pivot = new THREE.Group()
  group.add(pivot)

  const layer = group.children.filter(child => child.userData.isCubie && Math.round(child.position[axis] / SPACING) === sign)
  for (const cubie of layer) pivot.attach(cubie)

  const start = performance.now()
  const animate = now => {
    if (!isCurrent()) return
    const progress = Math.min(1, (now - start) / TURN_MS)
    const eased = progress * progress * (3 - 2 * progress)
    pivot.rotation[axis] = angle * eased

    if (progress < 1) {
      requestFrameRef.current = window.requestAnimationFrame(animate)
      return
    }

    for (const cubie of [...pivot.children]) {
      group.attach(cubie)
      cubie.position.set(
        Math.round(cubie.position.x / SPACING) * SPACING,
        Math.round(cubie.position.y / SPACING) * SPACING,
        Math.round(cubie.position.z / SPACING) * SPACING,
      )
      const quarter = Math.PI / 2
      cubie.rotation.set(
        Math.round(cubie.rotation.x / quarter) * quarter,
        Math.round(cubie.rotation.y / quarter) * quarter,
        Math.round(cubie.rotation.z / quarter) * quarter,
      )
    }
    group.remove(pivot)
    done()
  }
  requestFrameRef.current = window.requestAnimationFrame(animate)
}

export default function Cube3D({ cube, solution = '', appliedMoves = 0, className = '' }) {
  const hostRef = useRef(null)
  const groupRef = useRef(null)
  const threeRef = useRef(null)
  const cubeRef = useRef(cube)
  const solutionRef = useRef(solution)
  const requestedMovesRef = useRef(appliedMoves)
  const queuedMovesRef = useRef([])
  const processingRef = useRef(false)
  const generationRef = useRef(0)
  const processQueueRef = useRef(null)
  const [webglError, setWebglError] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    let active = true
    let frame = 0
    let resize
    let controls
    let renderer
    let cubeGroup
    let THREERef
    const turnFrameRef = { current: 0 }

    Promise.all([import('three'), import('three/addons/controls/OrbitControls.js')]).then(([THREE, orbit]) => {
      if (!active) return
      threeRef.current = THREE
      THREERef = THREE
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100)
      camera.position.set(5.2, 4.1, 6.4)
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.3
      host.appendChild(renderer.domElement)

      controls = new orbit.OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.07
      controls.enablePan = false
      controls.minDistance = 5.5
      controls.maxDistance = 10
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.8

      scene.add(new THREE.HemisphereLight('#ffffff', '#777e91', 2.1))
      const keyLight = new THREE.DirectionalLight('#fff8ed', 3.4)
      keyLight.position.set(5, 7, 6)
      scene.add(keyLight)
      const fillLight = new THREE.DirectionalLight('#b8ccff', 1.5)
      fillLight.position.set(-5, 1, -4)
      scene.add(fillLight)

      cubeGroup = new THREE.Group()
      groupRef.current = cubeGroup
      scene.add(cubeGroup)
      makeCube(THREE, cubeGroup, cubeRef.current)

      processQueueRef.current = () => {
        if (!active || processingRef.current || queuedMovesRef.current.length === 0 || !groupRef.current) return
        processingRef.current = true
        const nextMove = queuedMovesRef.current.shift()
        const generation = generationRef.current
        animateTurn(THREE, cubeGroup, nextMove, () => generation === generationRef.current, () => {
          processingRef.current = false
          processQueueRef.current?.()
        }, turnFrameRef)
      }

      resize = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect
        if (!width || !height) return
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
      })
      resize.observe(host)

      const render = () => {
        controls.update()
        renderer.render(scene, camera)
        frame = window.requestAnimationFrame(render)
      }
      render()
      processQueueRef.current()
    }).catch(() => { if (active) setWebglError(true) })

    return () => {
      active = false
      window.cancelAnimationFrame(frame)
      window.cancelAnimationFrame(turnFrameRef.current)
      resize?.disconnect()
      controls?.dispose()
      renderer?.dispose()
      renderer?.domElement.remove()
      if (cubeGroup && THREERef) disposeCube(cubeGroup)
      groupRef.current = null
      threeRef.current = null
      processQueueRef.current = null
      queuedMovesRef.current = []
      processingRef.current = false
      generationRef.current += 1
    }
  }, [])

  useEffect(() => {
    cubeRef.current = cube
    solutionRef.current = solution
    requestedMovesRef.current = 0
    generationRef.current += 1
    queuedMovesRef.current = []
    processingRef.current = false

    if (groupRef.current && threeRef.current && cube?.length === 54) {
      makeCube(threeRef.current, groupRef.current, cube)
    }
    processQueueRef.current?.()
  }, [cube, solution])

  useEffect(() => {
    const previous = requestedMovesRef.current
    const next = Math.max(0, appliedMoves)
    const moves = solutionRef.current.trim() ? solutionRef.current.trim().split(/\s+/) : []
    enqueueBetween(queuedMovesRef.current, moves, previous, next)
    requestedMovesRef.current = next
    processQueueRef.current?.()
  }, [appliedMoves])

  return <div className={`three-cube-view ${className}`}><div ref={hostRef} className="three-cube-canvas" role="img" aria-label="Interactive 3D Rubik’s cube. Drag to rotate; solution steps animate turns."/>{webglError ? <span className="three-cube-hint">3D preview isn’t available in this browser</span> : <span className="three-cube-hint">Drag to rotate · turns animate with each step</span>}</div>
}
