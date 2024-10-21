import type { EntityId } from '@/stores/entity'
import type { Position } from '@/stores/single-entity-level'
import { setup, assign, emit } from 'xstate'

export type Action = {
  type?: 'attack' | 'move'
  actor?: EntityId
  target?: Position | EntityId
}
export const turnMachine = setup({
  types: {
    context: {} as {
      teamId: 'good' | 'bad'
      selectedId?: EntityId
      action: {
        type?: 'attack' | 'move'
        actor?: EntityId
        target?: Position | EntityId
      }
    },
    events: {} as
      | { type: 'turn.end' }
      | { type: 'action.select'; action: 'attack' | 'move' }
      | { type: 'action.end' }
      | { type: 'entity.select'; entityId: EntityId }
      | { type: 'target.select'; target: EntityId | Position }
      | { type: 'action.deselect' }
      | { type: 'entity.deselect' },
    input: {} as {
      teamId: 'good' | 'bad'
    },
    emitted: {} as
      | { type: 'entity.move'; entityId: EntityId; target: Position }
      | { type: 'entity.attack'; action: { type: 'attack'; actor: EntityId; target: EntityId } }
  },
  actions: {
    deselectEntity: assign({ selectedId: undefined }),
    selectEntity: assign({
      selectedId: (_, params: EntityId) => params
    }),
    selectActionType: assign({
      action: ({ context }, params: 'attack' | 'move') => ({
        ...context.action,
        type: params
      })
    }),
    selectActionTarget: assign({
      action: ({ context }, params: EntityId | Position) => ({
        ...context.action,
        target: params
      })
    }),
    removeAction: assign({
      action: {}
    }),
    addAction: assign({
      action: (_, params: Action) => params
    })
  },
  guards: {
    gameOver: ({ context, event }) => true,
    isAttack: ({ context, event }) => context.action.type === 'attack'
  }
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcCuAnAdgWQIYGMALAS0zADpkxcBbAFQ0wGI0tyxMIBtABgF1EoAA4B7WMWTERmQSAAeiAIwBWHsvIAWAMwA2AOwBORQa08TOxQBoQAT0QAOcltUbF95fb0Ame-a9avAF9A61YcAhIySmp6RnJUTFgwABswfCoIJg5JZBtyJNT03gEkEFFxSWlZBQQ3HnIeLzMNHj1VCzUvazsEJr1yewMvHx4ee10dRuDQxjwiUgoqWgY2ArSMrMwcvIg4FPXi2XKJKRlSmsVFV00vfR4LPV1lRR1uxFUtBo0PfTcvIY0GmmIDCc0iixiK0w+X26Ugm22MMKyEOpWOlTOoAuw3U91MylMeOUeg0bwQpk+PC0Jl0ox0Bj0jOBoIiC2iyziazhEHIBAxAGVYRiERI8lyUfwjmITlVzohbhpyEYhlpBnpLjoNF5lGTqQYBoovHp7DwNDp7N8LczZqyoktYqshZBeelToLkacmHzTkiDpK0dKMdV5aZyKpfDxFKNVc8VGTzZSVAYNN42ozlMprVgwWz7VDfdzKLh0DBkO71p7vdJyLtxajhIHTsGEC19cojc59C1TTrbO9k0rGpqHrc9BYs+F5nbIZynTzkMXS+XXdIvSvoXX-Q2Kk25QgLYqzIZRsadP5lAYyWbFGHlT5Hh4tNodBOc9OOY7kc6FyWwGWhZ6P6lgWEolNuMqYvIiCMjo5A+G4JI6Mo3wXpefYIKobZ3p4zjjM+r62hCH4bnORa-v+HqrkBf4gVwihgWUjayliiBIZ8ehqAeXjaBxATxv4cHaPcKHjOMegEVOREOiRX48lWmAAIKYMQNC4MK8nsJw9aMTuzFQbUhIDPoOgmSmWiXFq8ZaP09LJtSVz2DoqpBMCmAiLWsgspJUq6ZBNRoT0AC0hjkFcBgXhxjkZkhmYhCCNqSey0k+RBzaKAEDRNMmrTtFG7Zkm0AxDCMBilRmBj0hJ4JJfmCTipAKVBnuVyXAMwmRqMeLWbqjJwf8SEvACkYGFVuYzp+6wNQGvlpX4YZjCaUZUu4ly9j05leE4hpjimyYWBMo3vtJIHOvJy5NeBF36f4iqRaMvjGmazjxoo-SeEYjwWRmY6HVJ+b1fOi5-udu6XaD+nEvqZ7pc5jnngFiAoWGlpmmMyaOVov01bOskuhiSkqWp4PouDFzRg0BgWiYxj+KaWjxi0TjfUhFpU-oWP4CINBCKkVCNaT7x6GSUVwS83H2Co-hU8EwRAA */
  context: ({ input }) => ({
    teamId: input.teamId,
    selectedId: undefined,
    action: {
      type: undefined,
      actor: undefined,
      target: undefined
    }
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
                    type: 'selectActionType',
                    params: ({ event }) => event.action
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
                    type: 'selectActionType',
                    params: ({ event }) => event.action
                  }
                },
                'target.select': [
                  {
                    target: 'actionAnimation',
                    actions: {
                      type: 'selectActionTarget',
                      params: ({ event }) => event.target
                    },
                    guard: 'isAttack'
                  },
                  {
                    target: '#turnMachine.teamTurn',
                    actions: [
                      {
                        type: 'selectActionTarget',
                        params: ({ event }) => event.target
                      },
                      emit(({ context, event }) => ({
                        type: 'entity.move',
                        entityId: context.selectedId as EntityId,
                        target: event.target
                      })),
                      'deselectEntity',
                      'removeAction'
                    ],
                    reenter: true
                  }
                ]
              }
            },
            actionAnimation: {
              entry: [
                emit(({ context }) => ({
                  type: 'entity.attack',
                  action: {
                    type: context.action.type as 'attack',
                    target: context.action.target as Position | EntityId,
                    actor: context.selectedId as EntityId
                  }
                }))
              ],
              on: {
                'action.end': {
                  target: '#turnMachine.teamTurn',
                  actions: ['deselectEntity', 'removeAction']
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
