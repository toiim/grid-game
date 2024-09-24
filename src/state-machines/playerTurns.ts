import { createMachine } from 'xstate'
export const handleTurnsMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgAcAbdATzACcAVAVzvwGIx8JnWBtABgC6iUGQD2sXABdcY-CJAAPRADYAzPxIqVATjUAmAwBYArCZ0m1AGhDVERgOwOS-I2qP9DagIwAOP74OAL5BNmhYeISklDT0POyc3Cz4vN7CSCDikjJyCsoI7vok+jr6Kpa+-N78TiY2dghuviQ+KoHe+ib6Du6WIWEYOATE5FS0jMkkTPiwYBRgmFKQbLPziwCi+DJS1ALpohLSsvIZ+d46OiS+Fvx6VTo1pnW2iA4mRi5qKo5GpjqmRn0-RA4SGUVGsQmrBIqwWSwgbAgcDmcM2212QgUWSOuVOiG8gJI3hMvjMvVKpV8vnqiH8l34Gn0viM2ipJn4vmBoMiIxi43iMJRi0gMOwYgA7gAFCSSABG8wAgotjrAVkKpEqcilMRlsVq8vZ9Jp2Q5fPpzvwVD1LNYXghrt4SA4HuaOg5+OzzlzBjzomM4pNYcKIKKJQx0HQYFJVUGpOHI2ApHssYd9Xj7RyXA5uk4dN4vt4aQhKVcOSTHNmSb4VN6IsM-ZCBbGRbAxeL41HVUjY5rjsndanjgbGt5HWo1OYTFajQT3kXqh0rkZSoZrfomrWwSNEgBxdCoMBsTB0MDoJYAOTA4r3B-7B2yQ-TZWceYn5XH+e8ultDS+zksrodCStzmEYm6+jCUgRlIN6HrAUF0EmOr3jiJygGcTgtGoZqdJ4HqGDoKhFpYzj6GUU6kp0uiWuB9YkOg+C4BgSy9nIbB3pkg64uhtIei0gIlOyeYlNcRa6M0Khfn42iAu6y60eCDFMWeYCsewqT7JxD7cUoryLhy2aEYRM6kmJ7hOpUo78JagSAjWwL4GI3YKNy9YptpaG6QgAC0ZQtJJ2HOlW-jmkWhgmCQAG3CyrjstcnKhCCPp0XyAasO5qHDuaWjYZJRpGKOfjOmJtwWUJbRmn4PgKby-pQvgUwzOqkAZWmPEILoOXVh0riFYEOhFm8HwMt86jmg4xLYTVDb8oGzUQK1j7tYUJCmD4GgeioVRznaDgFWVHIqOFOgOLo00QrN0LNiGrYStKsByoqypyPAA4ecOagPKtlj5tZU7bUYRZmpcTImNU4WmOU3jnal9WCms8Khu2EadotOn5ICEVkWUVqBO4X6A3aFiOqaYP5kazoFQlAx1uCu77mAaOefkU4Ra0AXMqdBFFn+kUGIVnSVBY-znfB0GwUzH2aGUNQUsuDIEg4xFqKR5G-GUZGeOdSnMapz2eXqS1eZURRvOuZhuLLxKDe8nyjfzE0VCEIRAA */
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
