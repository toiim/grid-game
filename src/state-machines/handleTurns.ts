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
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgAcAbdATzACcAVAVzvwGIx8JnWBtABgC6iUGQD2sXABdcY-CJAAPRAFYATABoQ1RAEYAzAA59JAJz8AbGoDspixf3WALE+sBfN1rRY8hUpRp6HnZObhZ8Xl1hJBBxSRk5BWUEQ0MLEmsLXWdrZ1cVflMtHQR9C2sSAv5+NVdawzVypw8vDBwCYnIqWkZwkiZ8WDAKMEwpSA58GSlqEiGRsYFo0QlpWXkY5IdDDP0nMutDQv5DU2tixAcK60aVFVddSxUzlpBvdr8uwN7WOeHR8YQSbTWYQOD-RZCBRxNaJTaXIy7fblI7mU7nbSIQzZMwqfSWUymfb8JxqUyvd6+ToBHrBP4LQFzbBiADuAAUJJIAEYjACCY3WsDY8wB-ISEShMRh4qSen4exI+nMVgaWV0900mIQNwqTjxhTUulMe32KgpbSp-m6QT6IrGkCZrIY6DoMCkQrtUmdrrAUiW0NWMvhCDUlhITksajU+ijaMsTguCDR4bxujUhhUugzzjU5p8HSt3zpnodsGZLO9bqFYM9YvW-qlgfWsoQjwVSsjqt06tJifK6VMqd0Ln2hhceY+nVCAHF0KgwGxMHQwOhxgA5MAs2fzhsreLN4NR9IRqzR2MneOJtPpaq3iwqU9ZIwTy1zKQuqTbhewd90P2SvdYQ2UBkiPcNIzPMkLwsBMtQsBoSHlGCXEsQxchuF8CxIdB8FwDBxjrOQ2F3WImzhEDLk1EoDEcMxOwfcpMxsTDPhwvDVzAQj2EiZZSP3cilEQQ1jwgmMoKOGDE2sGNKjKUksyzRx4I8TwQHwMQawUSkCwDfjgMEhAAFoLETYyWOpa0fn06UDwo0prF0EhamEmo7n4NtEz1XVU0zawkJg-RzMLWk+gGEsIF0oCWycI0nPkixXIKDy4PUEgsjOTJo1seSgq+ELfnCyKgzs3JHIzdU3IeI19ETFRThTfR1VVZ41AfXKaRtAqIUZMtWQ5WBuT5AU5HgRs9JbbFTBIcq7gKKrjT7YxELk7Jr0MdrLOLbrS3LStfVGwDioMtN+AqXQYO7MoakOKNFpUWTkJPNDckC1TtM+Gc5zAIrbIM9MdnlcxnGyUN3POq99ERe8rGkur9icCxcp-D8vx+gTkl7LUDDURDjH0B8lQOaw6tytj8M44brLI-SMaooS6pINMCnxdMc3gs0VKAA */
  description: `complete game loop for multiple teams`,

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
                selectAction: 'showTargets'
              }
            },

            showTargets: {
              on: {
                selectTarget: {
                  target: '#(machine).animateAction',
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
  },
  context: {
    selectedId: undefined,
    action: {
      type: undefined,
      actor: undefined,
      target: undefined
    }
  },
  initial: 'startGame'
})
