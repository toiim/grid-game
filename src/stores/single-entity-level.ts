import { ref, computed } from 'vue'
import type { EntityId, Entity, BaseEntity } from './entity'

export type Coordinates = [x: number, y: number]
export type Position = {
  coordinates: Coordinates
  entity: EntityId | undefined
  blocked: boolean
}
/** Coordinates are [x,y] number Tuples */
export type Grid = Position[][]

function generateGrid(gridX: number, gridY: number): Grid {
  const grid = [] as Position[][]
  for (let y = 0; y < gridY; y++) {
    for (let x = 0; x < gridX; x++) {
      if (!grid[y]) grid[y] = []
      grid[y][x] = {
        coordinates: [x, y],
        entity: undefined,
        blocked: false
      }
    }
  }
  return grid
}

export function createLevel(gridX: number, gridY: number, initialBlockedPositions?: Coordinates[]) {
  const entities = ref<Record<string, Entity>>({})

  const grid = ref<Grid>(generateGrid(gridX, gridY))
  if (initialBlockedPositions) {
    initialBlockedPositions.forEach(([x, y]) => {
      grid.value[y][x].blocked = true
    })
  }

  function blockPosition([x, y]: Coordinates) {
    grid.value[y][x].blocked = true
  }
  function unBlockPosition([x, y]: Coordinates) {
    grid.value[y][x].blocked = false
  }

  if (initialBlockedPositions) {
    initialBlockedPositions.forEach((blockedPosition) => blockPosition(blockedPosition))
  }

  function moveEntity(entityId: EntityId, newCoordinates: Coordinates) {
    const [newX, newY] = newCoordinates

    if (!entities.value[entityId]) {
      throw new Error('EntityID does not exist')
    }
    if (grid.value[newY][newX].blocked) {
      throw new Error('Position is blocked')
    }
    if (grid.value[newY][newX].entity !== undefined) {
      throw new Error(`Another Entity already exists in position ${newCoordinates}`)
    }
    const [currentX, currentY] = entities.value[entityId].coordinates

    grid.value[currentY][currentX].entity = undefined
    grid.value[newY][newX].entity = entityId
    entities.value[entityId].coordinates = newCoordinates
  }

  const entityIds = computed<EntityId[]>(() => {
    return Object.keys(entities.value)
  })

  function updateEntity<K extends keyof Entity>(entityId: EntityId, key: K, newValue: Entity[K]) {
    if (!entities.value[entityId]) return
    entities.value[entityId][key] = newValue
  }

  function addEntity(coordinates: Coordinates, baseEntity: BaseEntity): EntityId {
    const [x, y] = coordinates
    const entityId: EntityId = crypto.randomUUID()

    if (grid.value[y][x].blocked) {
      throw new Error('Position is blocked')
    }

    if (grid.value[y][x].entity !== undefined) {
      throw new Error(`Another Entity already exists in position ${coordinates}`)
    }

    const entity: Entity = {
      ...baseEntity,
      id: entityId,
      coordinates,
      move: (coordinates) => {
        moveEntity(entityId, coordinates)
      }
    }
    entities.value[entityId] = entity
    grid.value[y][x].entity = entityId

    return entityId
  }

  const positions = computed<Position[]>(() => {
    const positions = [] as Position[]
    grid.value.forEach((y) => {
      positions.push(...positions, ...y)
    })
    return positions
  })
  const blockedPositions = computed(() => {
    return positions.value.filter((position) => position.blocked)
  })
  const matrix = computed(() => {
    return grid.value.map((y) => y.map((x) => (x.blocked || x.entity ? 1 : 0)))
  })
  const getPositionFromCoordinates = ([x, y]: Coordinates): Position => grid.value[y][x]

  return {
    grid,
    entities,
    entityIds,
    blockedPositions,
    positions,
    matrix,
    blockPosition,
    unBlockPosition,
    addEntity,
    moveEntity,
    updateEntity,
    getPositionFromCoordinates
  }
}
