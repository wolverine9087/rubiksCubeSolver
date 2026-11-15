import { FACE_ORDER } from './cubeNotation.js'

const NORMALS = {
  U: [0, 1, 0], R: [1, 0, 0], F: [0, 0, 1],
  D: [0, -1, 0], L: [-1, 0, 0], B: [0, 0, -1],
}

function stickerPosition(face, row, col) {
  switch (face) {
    case 'U': return [col - 1, 1, row - 1]
    case 'R': return [1, 1 - row, 1 - col]
    case 'F': return [col - 1, 1 - row, 1]
    case 'D': return [col - 1, -1, 1 - row]
    case 'L': return [-1, 1 - row, col - 1]
    default: return [1 - col, 1 - row, -1]
  }
}

function faceletIndex(face, [x, y, z]) {
  let row
  let col
  switch (face) {
    case 'U': row = z + 1; col = x + 1; break
    case 'R': row = 1 - y; col = 1 - z; break
    case 'F': row = 1 - y; col = x + 1; break
    case 'D': row = 1 - z; col = x + 1; break
    case 'L': row = 1 - y; col = z + 1; break
    default: row = 1 - y; col = 1 - x
  }
  return FACE_ORDER.indexOf(face) * 9 + row * 3 + col
}

function rotateQuarter(vector, axis, direction) {
  let [x, y, z] = vector
  const turns = ((direction % 4) + 4) % 4
  for (let turn = 0; turn < turns; turn += 1) {
    if (axis === 0) {
      const nextY = -z
      z = y
      y = nextY
    } else if (axis === 1) {
      const nextX = z
      z = -x
      x = nextX
    } else {
      const nextX = -y
      y = x
      x = nextX
    }
  }
  return [x, y, z]
}

export function applyCubeMove(cube, move) {
  if (typeof cube !== 'string' || cube.length !== 54 || !/^[URFDLB](2|'|)?$/.test(move)) return cube

  const face = move[0]
  const normal = NORMALS[face]
  const axis = normal.findIndex(value => value !== 0)
  const layer = normal[axis]
  const turns = move.endsWith('2') ? 2 : 1
  const direction = (move.endsWith("'") ? 1 : -1) * layer * turns
  const next = Array(54)

  FACE_ORDER.forEach((sourceFace, faceIndex) => {
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        const source = faceIndex * 9 + row * 3 + col
        let position = stickerPosition(sourceFace, row, col)
        let stickerNormal = NORMALS[sourceFace]
        if (position[axis] === layer) {
          position = rotateQuarter(position, axis, direction)
          stickerNormal = rotateQuarter(stickerNormal, axis, direction)
        }
        const destinationFace = FACE_ORDER.find(candidate => NORMALS[candidate].every((value, index) => value === stickerNormal[index]))
        next[faceletIndex(destinationFace, position)] = cube[source]
      }
    }
  })

  return next.join('')
}

export function isSolvedCube(cube) {
  return typeof cube === 'string' && cube.length === 54 && FACE_ORDER.every((face, index) => {
    const stickers = cube.slice(index * 9, index * 9 + 9)
    return stickers === face.repeat(9)
  })
}
