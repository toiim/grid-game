import type { SkillName } from './skills'
import type { Position } from './level'
import type { Status } from './status'
/** EntityId is a UUID accessible on all Entities as id */
export type EntityId = string

export type BaseEntity = {
  team: 'good' | 'bad'
  name?: string
  health: number
  strength: number
  defense: number
  speed: number
  magicSkill: number
  level: number
  status: Status[]
  skills: SkillName[]
}

export interface Entity extends BaseEntity {
  id: EntityId
  position: Position
  move: (newX: number, newY: number) => void
}
