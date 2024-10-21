import { ref, computed } from 'vue'
import type { EntityId, Entity, BaseEntity } from './entity'

// TODO: Alter all x,y number parameter to simply be {x}-{y} strings.

/** Position is represented as a string composed of {x}-{y} */
export type Position = string

function generateGrid(gridX: number, gridY: number) {
  const grid = {} as Record<Position, EntityId | undefined>
  for (let x = 0; x < gridX; x++) {
    for (let y = 0; y < gridY; y++) {
      grid[`${x}-${y}`] = undefined
    }
  }
  return grid
}

export type Grid = Record<Position, EntityId | undefined>

export function createLevel(gridX: number, gridY: number, initialBlockedPositions?: Position[]) {
  const entities = ref<Record<string, Entity>>({})
  const blockedPositions = ref<Set<Position>>(new Set())

  const grid = ref<Grid>(generateGrid(gridX, gridY))

  function blockPosition(position: Position) {
    blockedPositions.value.add(position)
  }
  function unBlockPosition(position: Position) {
    blockedPositions.value.delete(position)
  }

  if (initialBlockedPositions) {
    initialBlockedPositions.forEach((blockedPosition) => blockPosition(blockedPosition))
  }

  function moveEntity(entityId: EntityId, newX: number, newY: number, override?: boolean) {
    const newPosition = `${newX}-${newY}`

    if (!entities.value[entityId]) {
      throw new Error('EntityID does not exist')
    }
    if (blockedPositions.value.has(newPosition)) {
      throw new Error('Position is blocked')
    }
    if (grid.value[newPosition] !== undefined) {
      throw new Error(`Another Entity already exists in position ${newPosition}`)
    }
    const [currentX, currentY] = entities.value[entityId].position.split('-')
    const currentPosition = `${currentX}-${currentY}`

    grid.value[currentPosition] = undefined
    grid.value[newPosition] = entityId
    entities.value[entityId].position = newPosition
  }

  const entityIds = computed<EntityId[]>(() => {
    return Object.keys(entities.value)
  })

  function updateEntity<K extends keyof Entity>(entityId: EntityId, key: K, newValue: Entity[K]) {
    if (!entities.value[entityId]) return
    entities.value[entityId][key] = newValue
  }

  function addEntity(x: number, y: number, baseEntity: BaseEntity): EntityId {
    const entityId: EntityId = crypto.randomUUID()
    const position = `${x}-${y}`

    if (blockedPositions.value.has(position)) {
      throw new Error('Position is blocked')
    }

    if (grid.value[position] !== undefined) {
      throw new Error(`Another Entity already exists in position ${position}`)
    }

    const entity: Entity = {
      ...baseEntity,
      id: entityId,
      position,
      move: (newX: number, newY: number) => {
        moveEntity(entityId, newX, newY)
      }
    }
    entities.value[entityId] = entity
    grid.value[position] = entityId

    return entityId
  }

  return {
    grid,
    entities,
    entityIds,
    blockedPositions,
    blockPosition,
    unBlockPosition,
    addEntity,
    moveEntity,
    updateEntity
  }
}
