import type { EntityId } from '@/stores/entity'
import type { Position } from '@/stores/level'
import { setup, assign } from 'xstate'
export const handleTurnsMachine = setup({
  types: {
    context: {} as {
      turn: 'good' | 'bad' | undefined
      selectedId: EntityId | undefined
      action: {
        type: 'move' | 'attack' | undefined
        actor: EntityId | undefined
        target: Position | undefined
      }
    },
    events: {} as
      | { type: 'turn.end' }
      | { type: 'entity.select'; entityId: EntityId }
      | { type: 'entity.deselect' }
      | { type: 'target.select' }
      | { type: 'action.select' }
      | { type: 'action.deselect' }
      | { type: 'game.create' }
      | { type: 'game.start' }
  },
  actions: {
    updateCurrentTeam: () => {},
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
  /** @xstate-layout N4IgpgJg5mDOIC5QAsCGA7CAbMAVArgE7qwCyqAxsgJbpgB0ADlqgJ5iEHEDEYmX6ANoAGALqJQjAPaxqAF2pT0EkAA9EAZgCMAVnoBOACwA2YcI06AHMf36A7JZ0AaEK0036wy3f3DDlwzs7HWFjAF8wlzRMHAEySho6JhZ2TiJ0Xn50wS1xJBBpWQUlFXUEHTtjeitfEMtLfUdLFzcEDQ1heg1jLQ1DLQAmYwHhLWE7QwiojGw8dPiqWgZmNg4BenwSMBwKOUhMhTlWelhtsF2RPMkZeUVlfLLbejsBk2EBhtsLHQGWxGGNPQPhpfJUdIZ9EN9FMQNFZnFyIskitUutTjs9hADvJjhA4GcLmIVIVbiUHogALS9QHmAYaOwaAZaQKGRm-VyIfRaOz0YyGCEOYQ6YwMxwwuGxeaIxLLFJrdInAmYk7IKQAdwACjJZAAjHAAQV2d1g2KOioxl2JN2K91AZWCWmeXn6jK5hi8zg5CDsWiqQz8wP570s4pmkuICxlyVWaWI5vOytgqs12uoerAhptJvRCczd0t+RJNtKmnaQOMOhCfnGPXBGj+CG8el9wXeoR02kroZicwj0qW0dRCpzu0gKvVuFQhBgcmzSsn07AcgL1yKdxLCDGfme7QsdL5Hx+DesehG9UsAwqFfMWm78KlCQHKPlcZHieTC5nJrxb7zShXBTWuu5LlFYQLvPY+jGCeQrGA2Dj6ECFjDFYPT0tCkSwmGvYkP2SR8BAADiqAALZgNwFCEGAqB7AAcmAarEWRAFFsBdqUiMPJ0vS9QDAMkL6O0hgNgMDJdHxfSWOhFgaHe4a4Y+SSwHIU5yEx5HKapLFAWS7EIFSfKeOMfEvIJIqQp6rSGK89CWH4wzGNodIQiGmESjhkYDhg1AkTRGZGko3DaWuulqJyTwBMYjnWTYPhGA2HTNvYdgeloRh9BMckeXhDDeb5ex-hkORXIBIW2mFjbgry1mBEENT1l6GgBNUkL8nx9j8Tot4wugUg-io7kIopYBWmVG4Upep7tA4F78fxQkNsyjpst09Iiu09SyW52FDUisoxgIo2kuVZRUpYjq0vSjLMhMbINiytmGMK7RaLoraudMPa7VGz6xugGxbBikBHcWIFUjZnw9P4XJdUEwlesMAzPKYJjeKyIxbZ9959sNg4vv9b7A4WOknYgk1AmMdmNBeFjxQjoSPcKb1cqY1hZd9T5yn98ajhA44prAuoGgFJAg2xFUdICTJeMI1N0jodOtDYhhdE9FausMLzdVj8meciXNokqY5JhOU5fmLoX2u69DMheRjCu1NjHoJ9C1WMT3vB0wzsw+e30AR6kW6Tm6+K7l4vCCDLWTdIliStVhaJtlT0j7ON+5phBqaRI3E2NYOJ4CujChUzIurFCUdgYlSCcyl5NV4qcKX7eV+YVQcbrYiEuuYwzvD6JgNsrqvCheEd9AMEQREAA */
  id: 'handleTurnsMachine',
  description: `complete game loop for multiple teams`,
  initial: 'startGame',
  context: {
    turn: undefined,
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
        'turn.end': [
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
            showPossibleActions: {
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
                  target: '#handleTurnsMachine.playerTurn.selected'
                },
                'action.select': 'showTargets'
              }
            },

            showTargets: {
              on: {
                'target.select': {
                  target: '#handleTurnsMachine.animateAction',
                  actions: 'sendAction',
                  reenter: true
                },

                'action.deselect': {
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
        'game.create': 'startGame'
      }
    },

    startGame: {
      on: {
        'game.start': {
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
