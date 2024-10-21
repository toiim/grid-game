import type { BaseEntity } from '@/stores/entity'

type LevelConfig = {
  description: string
  width: number
  height: number
  entities: { x: number; y: number; entity: BaseEntity }[]
}

export const level001: LevelConfig = {
  description: '',
  width: 5,
  height: 5,
  entities: [
    {
      x: 0,
      y: 4,
      entity: {
        teamId: 'good',
        level: 1,
        name: 'blue',
        stamina: 3,
        maxStamina: 3,
        skills: [],
        defense: 10,
        strength: 10,
        health: 10,
        maxHealth: 10,
        speed: 10,
        status: [],
        magicSkill: 50
      }
    },
    {
      x: 1,
      y: 1,
      entity: {
        teamId: 'bad',
        level: 1,
        name: 'white',
        stamina: 3,
        maxStamina: 3,
        skills: [],
        defense: 10,
        strength: 10,
        health: 10,
        maxHealth: 10,
        speed: 10,
        status: [],
        magicSkill: 50
      }
    },
    {
      x: 2,
      y: 2,
      entity: {
        teamId: 'good',
        level: 1,
        name: 'red',
        stamina: 3,
        maxStamina: 3,
        skills: [],
        defense: 10,
        strength: 10,
        health: 10,
        maxHealth: 10,
        speed: 10,
        status: [],
        magicSkill: 50
      }
    },
    {
      x: 4,
      y: 3,
      entity: {
        teamId: 'bad',
        level: 1,
        name: 'purple',
        stamina: 3,
        maxStamina: 3,
        skills: [],
        defense: 10,
        strength: 10,
        health: 10,
        maxHealth: 10,
        speed: 10,
        status: [],
        magicSkill: 50
      }
    }
  ]
}
