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
  /** @xstate-layout N4IgpgJg5mDOIC5QBcCuAnAdgWQIYGMALAS0zADpkxcBbAFQ0wGI0tyxMIBtABgF1EoAA4B7WMWTERmQSAAeiALQAOAKzlVATgAsPAGwAmbQbUGAjDwDMAGhABPRNtXrly83r2Xll1ZYDseqoAvkG2rDgEJGSU1PSM5KiYsGAANmD4VBBMHJLIduTJaRm8AkggouKS0rIKCIoGfuR6fn7KemZmfsaaljzatg51Bv7kPf5+Zm0Gmu3eIWGMeESkFFS0DGyF6ZnZmLn5EHCp2yWyFRJSMmW1Zlqjzco8PD2qBs9qA0rm2qOqE1MzHjKYx+eYgcJLKKrWIbTAFY4ZSC7fbworIU5lc5VK6gWqWPQ8DR+VTaPyaHgdUnaYGfIYjMYBEyaCYGQxgiGRFYxdbxLaIrI5CT5GgiABuYAxwjEF2q10Qqk65GBJmmOkegU0tPq9Ms-maXie2m07MWnOiazimwRmXIBGxAGVrZdkULUSd+GdpdiaohGjMAo9ScSKcD+vZELc9E01ArtJ0LAFfCasJCuRbYW7+baMpdHWjnXbLpn0R7MV7Lj6EJ1GoZqbdLAZpsozCZaX4DOReoEeBMeKoPG1QaFwabluaYbzrZBKLh0DBkHntgWc9JyIc+SXSlLKhW5Qh8WZyEYg7oTK4-FrCX4G54TH92xTyXpkxEx9CeVa0dPkLP54uV8wharhukrlOWsq4og+JXgSxhmIEejAg2tK3D8TjXr4yiaH8jbEi+qbjh+cIbt+v5gAuTrSCwZHIMWoFYrukEIL4jS+M4biJsM1Jth2XbaJozaWAJuoUvhZrvpaxFThABQANbECkKQAIKYMQNC4NiTBAXCHDcKW24yji8i+syTRaIYkxUk8mrhnSfq6gE16PH0xpgpgIjrrIHJvp6O4QcZdRmNolhHkYJh6HGB6NqoWr9lG7Qtu2Zg6A2DZiW+3KSb5hmVoo2GhcYbSRe00VaqSmjkB0iVxq8hiaAY6VQplGaJCREDZd6e6KKSBXhcVLZGFqlg9VVDRmL0GHNI1aYTp+2yQB1jEBd1PzTLoqgUnoDIRVqrhHjevRYToQWNtNhGScW07af+nUGbdAUhX4fY6MJ+iGPig22flJi9F4ygtL4wyaGdEkZm1M5zuRN1LQx-l4p4nZqLolhBdeTwxV96g-VY57Eg2wUg81k5fjJsDyYpKlqRpMPgUZtRkuowmhroMZ9m2h6tL06GqG0PjA8O3lNfgIg0EIaRUItcPyqtxL8V0wI9rcZi0k4Py3p0EWtMFPQhCEQA */
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
