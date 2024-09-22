import { ref, computed } from 'vue'
import type { EntityId, Entity, BaseEntity } from './entity'

/** Position is represented as a string composed of {x}-{y} */
export type Position = string

function generateGrid(gridX: number, gridY: number) {
  const grid = {} as Record<Position, Set<EntityId>>
  for (let x = 0; x < gridX; x++) {
    for (let y = 0; y < gridY; y++) {
      grid[`${x}-${y}`] = new Set<EntityId>()
    }
  }
  return grid
}

export function createLevel(gridX: number, gridY: number) {
  const entities = ref<Record<string, Entity>>({})

  const grid = ref<Record<Position, Set<EntityId>>>(generateGrid(gridX, gridY))

  function moveEntity(entityId: EntityId, newX: number, newY: number, override?: boolean) {
    if (!entities.value[entityId]) return
    const newPosition = `${newX}-${newY}`
    const [currentX, currentY] = entities.value[entityId].position.split('-')
    grid.value[`${currentX}-${currentY}`].delete(entityId)
    grid.value[newPosition].add(entityId)
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

    const entity: Entity = {
      ...baseEntity,
      id: entityId,
      position,
      move: (newX: number, newY: number) => {
        moveEntity(entityId, newX, newY)
      }
    }
    entities.value[entityId] = entity
    grid.value[position].add(entityId)

    return entityId
  }

  return { grid, entities, entityIds, addEntity, moveEntity, updateEntity }
}
