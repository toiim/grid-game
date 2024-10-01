import { createMachine, setup, assign } from 'xstate'

const subState = setup({
  actions: {
    addName: assign({
      name: (_, params) => params
    })
  }
}).createMachine({
  initial: 'hello',
  context: {
    name: undefined
  },
  states: {
    hello: {
      entry: () => {
        console.log('substate machine is running...')
      },
      on: {
        CONVERSE: { target: 'conversation', actions: { type: 'addName', params: () => 'tim' } },
        REJECT: 'departure'
      }
    },
    conversation: {
      on: {
        END: 'departure'
      }
    },
    departure: {
      entry: () => {
        console.log('inner final')
      },
      type: 'final'
    }
  }
})

export const testMachine = setup({
  actors: {
    subState: subState
  }
}).createMachine({
  id: 'test-machine',
  initial: 'start',
  states: {
    start: {
      on: {
        NEXT: 'middle'
      }
    },
    middle: {
      invoke: {
        id: 'sub-state',
        src: 'subState',
        onDone: 'end'
      }
    },
    end: {
      entry: () => {
        console.log('outer final')
      },
      type: 'final'
    }
  }
})
