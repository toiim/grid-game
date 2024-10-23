import type { LevelConfig } from './types'

export const level001: LevelConfig = {
  description: '',
  width: 5,
  height: 5,
  background: 'forest-01',
  blockedPositions: [],
  entities: [
    {
      coordinates: [0, 4],
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
      coordinates: [1, 1],
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
      coordinates: [2, 2],
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
      coordinates: [4, 3],
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
