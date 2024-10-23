import type { LevelConfig } from './types'

export const level002: LevelConfig = {
  description: '',
  width: 5,
  height: 5,
  background: 'village-01',
  blockedPositions: [
    [0, 0],
    [0, 1],
    [3, 2],
    [3, 3],
    [4, 2],
    [4, 3]
  ],
  entities: [
    {
      coordinates: [0, 4],
      entity: {
        teamId: 'good',
        level: 1,
        name: 'blue',
        stamina: 3,
        maxStamina: 3,
        skills: ['fire-blast'],
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
      coordinates: [0, 4],
      entity: {
        teamId: 'good',
        level: 1,
        name: 'red',
        stamina: 3,
        maxStamina: 3,
        skills: ['heal'],
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
      coordinates: [4, 4],
      entity: {
        teamId: 'bad',
        level: 1,
        name: 'purple',
        stamina: 3,
        maxStamina: 3,
        skills: ['freeze'],
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
        skills: ['slash'],
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
        name: 'pink',
        stamina: 3,
        maxStamina: 3,
        skills: ['slash'],
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
      coordinates: [2, 3],
      entity: {
        teamId: 'bad',
        level: 1,
        name: 'jacket-blood',
        stamina: 3,
        maxStamina: 3,
        skills: ['slash'],
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
