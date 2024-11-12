import type { EntityId } from '@/stores/entity'
import type { Coordinates } from '@/stores/single-entity-level'
import type { SkillName } from '@/stores/skills'
import { setup, assign, emit } from 'xstate'

// TODO: implement command point guards and decrements

type SkillAction = {
  skill?: SkillName
  target?: EntityId
}

export const turnMachine = setup({
  types: {
    context: {} as {
      teamId: 'good' | 'bad'
      selectedId?: EntityId
      commandPoints: number
      action?: SkillAction
    },
    events: {} as
      | { type: 'turn.end' }
      | { type: 'action.select'; skill: SkillName }
      | { type: 'action.end' }
      | { type: 'entity.move'; target: Coordinates }
      | { type: 'entity.select'; entityId: EntityId }
      | { type: 'target.select'; target: EntityId }
      | { type: 'action.deselect' }
      | { type: 'entity.deselect' },
    input: {} as {
      teamId: 'good' | 'bad'
      commandPoints?: number
    },
    emitted: {} as
      | { type: 'entity.move'; entityId: EntityId; target: Coordinates }
      | { type: 'entity.skill'; skill: SkillName; actor: EntityId; target: EntityId }
  },
  actions: {
    deselectEntity: assign({ selectedId: undefined }),
    selectEntity: assign({
      selectedId: (_, params: EntityId) => params
    }),
    selectActionSkill: assign({
      action: ({ context }, params: SkillName) => ({
        ...context.action,
        skill: params
      })
    }),
    selectActionTarget: assign({
      action: ({ context }, params: EntityId) => ({
        ...context.action,
        target: params
      })
    }),
    removeAction: assign({
      action: {}
    }),
    addAction: assign({
      action: (_, params: SkillAction) => params
    })
  },
  guards: {
    gameOver: ({ context, event }) => true,
    isSkill: ({ context, event }) => context?.action?.type === 'skill'
  }
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcCuAnAdgWQIYGMALAS0zADpkxcBbAFQ0wGI0tyxMIBtABgF1EoAA4B7WMWTERmQSAAeiALQAOAGzkAjAGYAnHoAsAdh0BWE-tMAaEAE9Euw+R7KtPAExuNJnRp2qAvv7WrDgEJGSU1PSM5KiYsGAANmD4VBBMHJLINuQJyam8AkggouKS0rIKCIpujqqGhmoaGob6bjqu+tZ21W5ajh39hhpq7aojWoHBjHhEpBRUtAxseSlpGZhZORBwSWuFsqUSUjLFVV465H6NPDwdJm53yibdSp76VybDo37ObYZTEAhWbhBZRZaYXJ7VKQDZbKH5ZAHYpHcqnUBVLSqHjkL7mYw8ZpGfTKLq2N79K5afqqNzKHTDNy0wHAsLzSJLGKrGHpTISHI0EQANzAyOEYmOFTOiBMLXIpLp7R0JJ4qm8r16lMGhnqWmUt30+hZMzZEUW0RW0LS5AIaIAylaTnD+Qj9vxDhK0ZVEAN6qp9UZDCZCaSyT0vOp-WYNPoWhoeDqTJMgkCTXMzeCuVbIDbUicHYinbaTq6Cu6UZ6Tt6EC06m4SV4tB4dMoNHSNYY3ORXGqE-GTKp-fVjVgQezzRDS9bkLh0DBkAW1kW89JyDtuUjy+KylXpQgsRpyPXA-p3Mpz4YNYocYYm6om88Go9fKqR6F02DOZbETmZ3OwAujrSEwxarhuYolJWUoYvY2LkDqPBtBoar+voTYal4Hz6F8WhJvSXweEGb5jhmX6Qhuv6zvOi4rswf7zlOEGoruMEIEmjhJmYyi1GqfQkh2XY9hYra6C4rgaMRpqfha5HZhAuQANbEIkiQAIKYMQNC4GiIG0ewnBMVB6LyD6DLkGqfieKSrS3DoV59AM1I6re+qIUagKYCI66yKyH4eju0EmdUMZaEe9Z0qosYHh4LzktUA6Rs0tSeMqTZNpJH4cjJ-mSsZVSKKYYVtGoUXjDFV5GJczRtq0XhMu0bgZaCWWTnEFEQDlXp7ooRhFRFpVtvWV5aL11W1NoCa4cOKa+c1E5Zj+HUVgFeVKIaR7KjwwbIdqkVXueR53q49LKjGHhNeOmbfmsOagZgNFdduuXVqFhhbcqLY9rSWJDXFhV0q4erKA0SZ9DoF2kTJU6Uf+gGFoFzGBZi97ds8p5aDGt63LFPT-S4PBAyDTZoRD0mTu1inKWpGlaY9kErdWxgmFcLihqezzBjjPqHo0nR4mouHgzNabNfgIg0EIyRUJ1LFBQO5Cxvog7xoa9R0uYGq6MzYkEzFp4MgEgT+EAA */
  context: ({ input }) => ({
    teamId: input.teamId,
    selectedId: undefined,
    commandPoints: input.commandPoints || 3
  }),
  id: 'turnMachine',
  initial: 'teamTurn',
  states: {
    teamTurn: {
      initial: 'unselected',
      description: 'single team turn loop',
      on: {
        'turn.end': {
          target: '#turnMachine.complete'
        }
      },
      states: {
        unselected: {
          on: {
            'entity.select': {
              target: 'selected',
              actions: {
                type: 'selectEntity',
                params: ({ event }) => event.entityId
              }
            }
          },
          entry: {
            type: 'deselectEntity'
          }
        },
        selected: {
          initial: 'actionSelection',
          on: {
            'entity.deselect': {
              target: 'unselected'
            },
            'entity.select': {
              actions: {
                type: 'selectEntity',
                params: ({ event }) => event.entityId
              }
            },
            'entity.move': {
              target: '#turnMachine.teamTurn',
              reenter: true,
              actions: [
                emit(({ context, event }) => ({
                  type: 'entity.move',
                  entityId: context.selectedId as EntityId,
                  target: event.target as Coordinates
                }))
              ]
            }
          },
          states: {
            actionSelection: {
              on: {
                'entity.select': {
                  actions: [
                    {
                      type: 'deselectEntity'
                    },
                    {
                      type: 'selectEntity',
                      params: ({ event }) => event.entityId
                    }
                  ]
                },
                'action.select': {
                  target: 'targetSelection',
                  actions: {
                    type: 'selectActionSkill',
                    params: ({ event }) => event.skill
                  }
                }
              }
            },
            targetSelection: {
              on: {
                'action.deselect': {
                  target: 'actionSelection',
                  actions: {
                    type: 'removeAction'
                  }
                },
                'action.select': {
                  target: 'targetSelection',
                  actions: {
                    type: 'selectActionSkill',
                    params: ({ event }) => event.skill
                  }
                },
                'target.select': {
                  target: 'skillAnimation',
                  actions: {
                    type: 'selectActionTarget',
                    params: ({ event }) => event.target
                  }
                }
              }
            },
            skillAnimation: {
              entry: [
                emit(({ context }) => ({
                  type: 'entity.skill',
                  skill: context.action?.skill as SkillName,
                  actor: context.selectedId as EntityId,
                  target: context.action?.target as EntityId
                }))
              ],
              on: {
                'action.end': {
                  target: '#turnMachine.teamTurn',
                  actions: ['removeAction']
                }
              }
            }
          }
        }
      }
    },
    complete: {
      type: 'final'
    }
  }
})
