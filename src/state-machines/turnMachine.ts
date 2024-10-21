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
  /** @xstate-layout N4IgpgJg5mDOIC5QBcCuAnAdgWQIYGMALAS0zADpkxcBbAFQ03NU1jABsx8qIBiMTMmLIAnuTaduAbQAMAXUSgADgHtYw4isyKQAD0QBGAOwBmcgA4ALOYBMBgKwBOe-ZsnT5gDQgRiGzJtyGQMANhNHSxlzcxcjOIBfeO80LDwiUgoqWgYsZlYOLh5eFKYBCFkFJBBVdSEtHX0EGW9fJsTkxjSSMkpqekZxAu5IfkFhMQg4IeQKnRqNeqrGgwNLA3JLGxCjGRDjExD7UJbEexkzGUt7c22DW0cbS0t2kBKujN7sgYlCkYEhUSDSQzeRzNQLbRLQwmGyBFZrO4GB4mS6WE4IExWIJXaImSxGexGGzmF5vAjdTJ9HJMH7DCDkAh1TAAZWmmkwowBYlpIMqynBTIafhClnIjiRbnMjiMKxFNns6PCjgsBhsRnMlxCVmuzySr065I+WX6uR5kAZ3HZrOB7N4jPZQMKsyq80FUIQbhk5DO0WCMnOMRWCp8iC1FwcESJBLiLlJBvSPWN1MddMouHQMGQ1sKtvtWnIkx5zv5tXZQoQkWVrlM9m2kUuwdaTlFjgCIr2RO2ezjqUNiap32m5uQ6cz2ctWmKo7AyBTvLBpcWoEacRC5GJdyMlkOVycjnRZyr4oe5hr5jxBx7OD7lK+pqH9JHGZn46ZU+fs6LBj51QFZfdhxmDsOqbJY7jnDY6IhG465gbsu7nueRhXu8-Z3jSD4WkyACCmDEDQuBviU5BlMWv6LpCy6GGca7mKqawonie4mAeTzepYzinlcNiOBqNiJHqmAqIWOhkgmYALhC5YALTWOi0mnhsjjKbxKJgQcxgoTenwmpR5FSe6qr2BY1h2E4LhuB46I7EEoSYpi-h4ps-F6mJFI6cmLBmhAklulRCAGOBQTEo8WwEiYriQSGFYwti1znvihLElp4keYOwKQL5-7+XcgQ+hqBj+piRwOIqqrkCYqpGM49gojKjy6h0vapUm6W-PSeYsmyS76X5eh+Hi5A7BqUSnlYYSNqGxgWNV+zwrEIQpe5rX3hlj7Tlm3V6a62X9QghLKtBgUOTcbhOOiu7sTqIRRBENwmEtRoDqt7VYeyuH4YRu07T1yxFUEvEcZVyKXCx0Uil6EWEocVhWI42yPT0+AqDQSicFQWW-acRjojcxl2NB1gOJKHECfEQA */
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
