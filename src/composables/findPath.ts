import type { Grid, Position } from '@/stores/single-entity-level'
import { AStarFinder } from 'astar-typescript'

const positionToArray = (position: Position): [x: number, y: number] =>
  position.split('-').map(Number) as [number, number]

const ArrayToPosition = (position: [x: number, y: number]): Position =>
  `${position[0]}-${position[1]}`

const gridToMatrix = (
  grid: Grid,
  blockedPositions: Position[],
  initialPosition: Position
): number[][] => {
  // remove initial entity so they don't block their own path
  grid[initialPosition] = undefined

  const positions = Object.keys(grid).map((key) => positionToArray(key))

  const matrix: number[][] = []
  positions.forEach(([x, y]) => {
    if (!matrix[y]) matrix[y] = []
    matrix[y][x] = grid[`${x}-${y}`] || blockedPositions.includes(`${x}-${y}`) ? 1 : 0
  })

  return matrix
}

export const findPath = (
  grid: Grid,
  blockedPositions: Position[],
  initialPosition: Position,
  target: Position
): Position[] => {
  const matrix = gridToMatrix(grid, blockedPositions, initialPosition)
  const aStarInstance = new AStarFinder({
    grid: {
      matrix
    },
    includeStartNode: false,
    diagonalAllowed: false
  })
  const initialPositionObject = {
    x: positionToArray(initialPosition)[0],
    y: positionToArray(initialPosition)[1]
  }
  const targetObject = { x: positionToArray(target)[0], y: positionToArray(target)[1] }
  const path = aStarInstance.findPath(initialPositionObject, targetObject) as [
    x: number,
    y: number
  ][]
  return path.map((pos) => ArrayToPosition(pos))
}
