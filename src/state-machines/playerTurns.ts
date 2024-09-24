import { createMachine } from 'xstate'
export const handleTurnsMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgAcAbdATzACcAVAVzvwGIx8JnWBtABgC6iUGQD2sXABdcY-CJAAPRADYA7ABYSGgBwBWNfz0qAzBoCMlgJwAaENUQa1VklYBM-fiqv8T5tQC+AXZoWHiEpJQ09DzsnNws+Lzmwkgg4pIycgrKCCY6OiQmVqZWGkZeGiZ6dg4IGhYk5lbVXm7mOmoq5hpBIRg4BMTkVLSMiSSwYBRgmFKQk9hiAO4M6HQwUrBsUzNzaxtgUgKpohLSsvJpuWrmKiQqbm4Wbvne-m61iO6FOvz6VT01RUejcej6IFCgwiI2i41YJCY+F2s3mEB201RAFF8DIpNQTgoMhdstdEM0XDorHp+C1+M1+Jo9DV7Ig1HotL4VE4Gnoyhy3BCoeFhlExrFJpi5pA2BA4FKpDi8QShETzlkrqBcj03E09PogRo+W4fjovggdM0SL5+G4dBoVCoCjSdEKBiLSPEAOLoVBgNiYOhgdDzAByYGWPr9hLSxI1OUQbnUrnMwKBfj83hM5pMyaB7UsYL+1LKbrCQ1IsCk6ykUf9VZrMbOmUuCYQ-jURXyTxpHlBxRU5qBnaeIKdoOMPhUZehw3Q+FwGHmAEE5pc2E30urW2SLUYihontTaeYTVTzd5Ct1ujpHYfDBorDOPbDxRMUdKIIsVgAFCSSAAjGZVw1bYPykEDLk3OMdy1RwPBIGk1B0dopzUaoTGzVkLSscwSGcW1C0MGlmmfCtXxid8FQWWAllWdZNm2OVwMguRoO3Uk4PqSwuz5Yw1A8HoOXNcx6V1e13FedDQSqV1gkhd1yPnRcQzAVj2GSU4txbTilDZU9rU6E1vEeel9AvMx8L+SxPCdTQkyCeT8DEZiFGFCs1R0zU9IQABaJMim6fJnH1ApT3Mc1Xj0RCTA8dwGmqKxqV6eT3JhMVKNYTySW83J2geN5T34CxLE6WxsO6fgrL0UTcwE2l9TI9LRky-BEWRaiIGy+Nd28ArbyKkqOmcc12U5XMHVi-xzCBOT+nLZq4QlcDIG62CfLMXUjQzTxjHpYTsPs6rUx6R8TXBVLFJhb1fTANbdNybpotBO0aV8Gqk0HbC6pigtT31WkVCMJrhgbOha1u+7csQEwqqTRl3DKHw-CcIcTBHJMOUPR4PEFS6FrnBclzUtddJgh79Lw2GC0eU9kLtUaOWtCb8mpXMQRMEHIha+E2pWr9aN-f9cCAknQKhttiiq7bU12oGZo0c0UJcV7RKio0QXMLmKN5yU9jRb96MOLYJd3Q9oqeT7kPQixuXNak8OQmrUw8ZwLDkoIgA */
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
          on: {
            selectEntity: 'selected'
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
            deselectEntity: 'unselected'
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
          guard: 'endGame'
        },
        'playerTurn'
      ]
    }
  },
  context: {
    selectedId: '',
    action: {
      type: '',
      actor: '',
      target: ''
    }
  },
  initial: 'startGame'
})
