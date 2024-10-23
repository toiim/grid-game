import type { SkillName } from './skills'
import type { Coordinates } from './single-entity-level'
import type { Status } from './status'

/** EntityId is a UUID accessible on all Entities as id */
export type EntityId = string

export type BaseEntity = {
  teamId: 'good' | 'bad'
  name?: string
  stamina: number
  maxStamina: number
  health: number
  maxHealth: number
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
  coordinates: Coordinates
  move: (coordinates: Coordinates) => void
}
