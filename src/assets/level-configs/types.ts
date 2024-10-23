import type { BaseEntity } from '@/stores/entity'
import type { Coordinates, Position } from '@/stores/single-entity-level'
export type LevelConfig = {
  description: string
  width: number
  height: number
  background: 'forest-01' | 'village-01'
  blockedPositions: Coordinates[]
  entities: { coordinates: Coordinates; entity: BaseEntity }[]
}
