import type { EntityId } from '@/stores/entity'
import type { Position } from '@/stores/level'
import { setup, assign } from 'xstate'
export const handleTurnsMachine = setup({
  types: {} as {
    context: {
      selectedId: EntityId | undefined
      action: {
        type: 'move' | 'attack' | undefined
        actor: EntityId | undefined
        target: Position | undefined
      }
    }
  },
  actions: {
    updateCurrentTeam: () => {},
    selectEntity: assign((_, entityId: EntityId) => ({ selectedId: entityId })),
    deselectEntity: assign(() => ({ selectedId: undefined })),
    sendAction: () => {}
  },
  guards: {
    gameOver() {
      return false
    }
  }
}).createMachine({
  id: 'handleTurnsMachine',
  description: `complete game loop for multiple teams`,
  initial: 'startGame',
  context: {
    selectedId: undefined,
    action: {
      type: undefined,
      actor: undefined,
      target: undefined
    }
  },
  states: {
    playerTurn: {
      id: 'playerTurn',
      on: {
        endTurn: [
          {
            target: 'endGame',
            guard: 'gameOver'
          },
          {
            target: 'playerTurn',
            description: `return to playerTurn with newTeamId`,
            actions: 'updateCurrentTeam'
          }
        ]
      },

      states: {
        unselected: {
          entry: ['deselectEntity'],
          on: {
            'entity.select': {
              actions: [
                {
                  type: 'selectEntity',
                  params: ({ event }) => event.entityId
                }
              ],
              target: 'selected'
            }
          }
        },

        selected: {
          states: {
            showPossibleActions: {
              on: {
                'entity.select': {
                  actions: [
                    'deselectEntity',
                    {
                      type: 'selectEntity',
                      params: ({ event }) => event.entityId
                    }
                  ],
                  target: 'selected'
                },
                selectAction: 'showTargets'
              }
            },

            showTargets: {
              on: {
                selectTarget: {
                  target: 'animateAction',
                  actions: 'sendAction',
                  reenter: true
                },

                deselectAction: {
                  target: 'showPossibleActions',
                  reenter: true
                }
              }
            }
          },

          initial: 'showPossibleActions',

          on: {
            'entity.deselect': 'unselected'
          }
        }
      },

      initial: 'unselected',
      description: `single team turn loop`
    },

    endGame: {
      on: {
        createNewGame: 'startGame'
      }
    },

    startGame: {
      on: {
        start: {
          target: 'playerTurn',
          reenter: true
        }
      }
    },

    animateAction: {
      always: [
        {
          target: 'endGame',
          reenter: true,
          guard: 'gameOver'
        },
        'playerTurn'
      ]
    }
  }
})
