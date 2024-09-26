import type { EntityId } from '@/stores/entity'
import type { Position } from '@/stores/level'
import { setup, assign } from 'xstate'

export const turnMachineFirst = setup({
  types: {
    context: {} as {
      selectedId: EntityId | undefined
      action: {
        type: 'move' | 'attack' | undefined
        actor: EntityId | undefined
        target: Position | undefined
      }
    },
    input: {} as {
      teamId: string
    },
    events: {} as
      | { type: 'entity.select'; entityId: EntityId }
      | { type: 'entity.deselect' }
      | { type: 'target.select' }
      | { type: 'action.select' }
      | { type: 'action.deselect' }
      | { type: 'turn.end' }
  },
  actions: {
    selectEntity: assign((_, params: { entityId: EntityId }) => ({
      selectedId: params.entityId
    })),
    deselectEntity: assign(() => ({ selectedId: undefined })),
    sendAction: () => {}
  },
  guards: {
    gameOver: () => false
  }
}).createMachine({
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
      on: {
        'turn.end': [
          {
            target: 'complete',
            guard: 'gameOver'
          },
          {
            target: '#turnMachine.teamTurn'
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
                  params: ({ event }) => ({
                    entityId: event.entityId
                  })
                }
              ],
              target: 'selected'
            }
          }
        },

        selected: {
          states: {
            actionSelection: {
              on: {
                'entity.select': {
                  actions: [
                    'deselectEntity',
                    {
                      type: 'selectEntity',
                      params: ({ event }) => ({
                        entityId: event.entityId
                      })
                    }
                  ],
                  target: '#teamTurn.selected'
                },
                'action.select': 'targetSelection'
              }
            },

            targetSelection: {
              on: {
                'target.select': {
                  target: '#teamTurn.selected.actionAnimation',
                  actions: 'sendAction',
                  reenter: true
                },

                'action.deselect': {
                  target: 'actionSelection',
                  reenter: true
                }
              }
            },
            actionAnimation: {
              always: [
                {
                  target: 'endGame',
                  reenter: true,
                  guard: 'gameOver'
                },
                'teamTurn'
              ]
            }
          },

          initial: 'actionSelection',

          on: {
            'entity.deselect': 'unselected'
          }
        }
      },

      initial: 'unselected',
      description: `single team turn loop`
    },
    complete: {
      type: 'final'
    }
  }
})

export const turnMachine = setup({
  types: {
    context: {} as {
      teamId: string
      selectedId: EntityId | undefined
      action: {
        type: 'attack' | 'move' | undefined
        actor: EntityId | undefined
        target: Position | EntityId | undefined
      }
    },
    events: {} as
      | { type: 'turn.end' }
      | { type: 'action.select' }
      | { type: 'entity.select'; entityId: EntityId }
      | { type: 'target.select' }
      | { type: 'action.deselect' }
      | { type: 'entity.deselect' },
    input: {} as {
      teamId: EntityId
    }
  },
  actions: {
    deselectEntity: assign(({ context, event }, params) => ({
      selectedId: undefined
    })),
    selectEntity: assign(({ context, event }, params: { entityId: EntityId }) => ({
      selectedId: params.entityId
    }))
  },
  guards: {
    gameOver: ({ context, event }) => false
  }
}).createMachine({
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
              actions: ({ event }) => ({
                type: 'selectEntity',
                params: { entityId: event.entityId }
              })
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
                    ({ event }) => ({
                      type: 'selectEntity',
                      params: { entityId: event.entityId }
                    })
                  ]
                },
                'action.select': {
                  target: 'targetSelection'
                }
              }
            },
            targetSelection: {
              on: {
                'action.deselect': {
                  target: 'actionSelection'
                },
                'target.select': {
                  target: 'actionAnimation'
                }
              }
            },
            actionAnimation: {
              on: {
                'turn.end': [
                  {
                    target: '#turnMachine.complete',
                    guard: {
                      type: 'gameOver'
                    }
                  },
                  {
                    target: '#turnMachine.teamTurn.unselected'
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
