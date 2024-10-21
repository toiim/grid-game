import type { BaseEntity } from '@/stores/entity'
import type { Position } from '@/stores/single-entity-level'
export type LevelConfig = {
  description: string
  width: number
  height: number
  background: 'forest-01' | 'village-01'
  blockedPositions: Position[]
  entities: { x: number; y: number; entity: BaseEntity }[]
}
