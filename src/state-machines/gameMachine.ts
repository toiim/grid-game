import { setup, assign, spawnChild } from 'xstate'
import { turnMachine } from './turnMachine'
export const gameMachine = setup({
  types: {
    events: {} as { type: 'game.create' } | { type: 'game.start' } | { type: 'turn.end' }
  },
  actions: {
    updateCurrentTeam: () => {}
  },
  guards: {
    gameOver: () => false
  },
  actors: {
    turnMachine: turnMachine
  }
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAsCGA7CAbMAVArgE7qwCyqAxsgJbpgB0ADlqgJ5iEHEDEALkenphMAbQAMAXUShGAe1jVe1WemkgAHogCMWsQDZ6egJwAmAOwAOCyaNaALGIsBWADQhWiM04MW7362YmAMxBdiYAvuFuaJg4XCTkVLQMzGwc8XwCQqJaUkggcgpKKmqaCDr6hqaW1rYOzm4eCBZaRvSh-ubBoRFRIDHYeAJklDR0TCzsnFn4JGA4FLyQ3MJKvKz0sPNgi+J5MvKKyqr5ZQC0Rm1OwRZmdl52dqGPjZ5mZvS29npiRmJmRhavWiGEG8RGSXGqSm8U220Wy1Wig2EDg8N4ezUhSOJVOiDOIRM9BMFkcTkcxh0QRMr3K-yJXScQS0QV+AJJkRBsSGxAhYxSk3SWS2CyWEE2yFkAHcAAryBQAIxwAEFFsdYCt0GsNiKdhjJFjDsUTqAyk5rvQ-Jcgt4gmYxEELHpabcxPQrACWk4jPbrEFOf1QXFhol+RM0tNiHDRZAJdK5bBFSq1SoNZRjdG9Zj8tjjaVEA42notM5rCZzICjHZne5EL4LJ8zNT9E47EZqXo7AGBsHeaHkuGYcL0bHYJKpbhUIQYLwNbwpzPM7sDTmjcc1E0LO3Le9dH4xMF9DSNIhAU56K0nFpjN5y0ZjN2gzyEqMB9ChVHdQjxWPpZPp2As7cOmxz0KiX76vsBRrripqeM4nzVpSfzsmYtJ7g2e56E47zmkEPxmI+3Lgv24zCBAADiqAALZgNwUA0QwFCEGAqBLNmBxFOueIIHYWhErYYi-FuTZhPYdi0mEPh+Nh1L3l0WhEWCIavuMsDzoQvBUbR9GMZsGmQYaXGwSeCBnCYYh2BedgWMyrRVlo7w1k01ZaPQTZMi0lwHvxehKb2L6QgwGDUNRbFgKqxrcBx0HGSapmXG0vh6HoPTGACVa0qy56tO8ZKtE89xdn0PbPnyA4hWFSyRcc0W5EZOLxWUzhWZ2Jj3LhW5BFlvj0N67VhDYgRGFekR9OgsjgWopUkapYANXmPFnGEDYkmSFJfNS6F8e05Z2jhTrUtW-llaRAoRvEC3cXBZmOm6a3OBtVLHk0eg2DurLthU-EOids1BYOH6CLMEGQFdJnnEd1mkqYrZOB6aG1gg7wfI6pImPZb04f6JVPv9YbvpGgigxA4NNYg5qfG9hLlp6VY2rSZjFh9LLWE6XqEbjxEqQDhOwiTcayvK1BKhFKYkGT+Z0kEVPdOWFZbi8SP1o2zbYW2HbFVyyl9nNgNE0uYqC-+M7wKucVS62bpboC14odU6GWZhlnYbhTIEX9PNhuR2nzebjVS60bphDhwQ+j09iI005gy9SwTwyWtlM3anu6wD6lTlpjGS0tJYy1o5qu+JLLpVlTKNsYzIh3dFip4FYaVeFNUmbm10JZclosg6b0HmY3y0sYVkdHoATdGEY3hEAA */
  id: 'gameMachine',
  description: `complete game loop for multiple teams`,
  initial: 'gameOpening',
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
    gameOpening: {
      on: {
        'game.start': {
          target: 'turn',
          reenter: true
        }
      }
    },

    turn: {
      initial: 'goodTeam',
      states: {
        goodTeam: {
          invoke: {
            src: 'turnMachine',
            input: { teamId: 'good' }
          },
          on: {
            'turn.end': 'badTeam'
          }
        },
        badTeam: {
          src: 'turnMachine',
          input: { teamId: 'bad' },
          on: {
            'turn.end': 'goodTeam'
          }
        }
      }
    },

    endGame: {
      on: {
        'game.create': 'gameOpening'
      }
    }
  }
})
