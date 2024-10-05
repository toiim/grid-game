import type { EntityId } from '@/stores/entity'
import type { Position } from '@/stores/level'
import { setup, assign, emit } from 'xstate'

type Action = {
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
      | { type: 'entity.select'; entityId: EntityId }
      | { type: 'target.select'; target: EntityId | Position }
      | { type: 'action.deselect' }
      | { type: 'entity.deselect' },
    input: {} as {
      teamId: 'good' | 'bad'
    },
    emitted: {} as { type: 'entity.move'; entityId: EntityId; target: Position }
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
  /** @xstate-layout N4IgpgJg5mDOIC5QBcCuAnAdgWQIYGMALAS0zADpkxcBbAFQ03NU1jABsx8qIBiMTMmLIAnuTaduAbQAMAXUSgADgHtYw4isyKQAD0QA2AIzkjAFhkAmGQHZbBmzYDMATksAaECMRHLl8o4yRkbOZn5mZgCsTgC+MZ5oWHhEpBRUtAxY4hxcPPyCwmIQcDnS8jqq6kJaOvoIRlYAHAFGjQYuNpYuka2NRp7eCGFOAS7dLjJmTgbGwWZxCYzJJGSU1PSM2ZI85ATVmADKpfv5QqJbubIKSCCVGjU3dUYzphFj5k5tRk6RHl6I02aZjGzkcUyM0SiCxAiRwBBWaXWmSYElykF23E0h2OWN4eyxFzK12Uanu2keiC6ZlMlmBEz6kycZhsA0QkSmLQMlnZwRcBjMBka0Nhy1Sawym1R3HRyFw6BgyCO21x+K05GKUuQVwqpP2tUpLmpvjpMgZU2ZrKGLhGlmelgMMlN7VNzmFS3hYvSGyymplcoVStyuNl8rAyEJWvKNzueopCAMP1eMgd9uBxjCluizW+XQhYUCrjdSQ9qy9yIj6NVmAAgphiDRcCdYeQBBBtdHdVj9fVIsnyH1ad8ZEzImMnJmIuR2d1GjYol1GlYi3CUqWkZLjpXMVpa-XG8HNq2pEZibdOw9QE8gs0bK12p1ur1+v8EE5nOQuuN+cPZ05bHF4hATAVA1HQRRLMAdSqLs4wAWiZftRxsNw3CcPwHUaS1YL5AIFxcBpXDfCJImXUU1wlLAoLJbtviTaw7BsBxnHwlwsJcD8F0aaI-2tRo+JIwDwNXREKKYFhfQgKjY0vHxuRscg0KsJw3z5PjZ0tH5-GQvlkwfMxzFdQT3WE8VvRRTdJI7aCLz0RA53IR1HKcpzxxfSxF3IMYOnc203C6BxSIg0zywkjF9kDbdyRJayots+o-Ac5ykuHTNPnIBN3L5QFaQiQKTLLDdtj9UNFRxGyYxgmShgcUwkKUlw+lvAxLQiGR0uZOcZEiLi+UiATFmLfL1x9CywqxXcG2ks8Yu7ZC2sFOcDG6gV3mal8s3StDGiywUcvmIzBoRch8BUGglE4KgpMquLIhZF82kiD87TMPpfk+YEAJiIA */
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
      states: {
        unselected: {
          on: {
            'entity.select': {
              target: 'selected',
              actions: {
                type: 'selectEntity',
                params: ({ event }) => event.entityId
              }
            },
            'turn.end': {
              target: '#turnMachine.complete'
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
              on: {
                'turn.end': [
                  {
                    target: '#turnMachine.complete'
                  }
                ]
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
