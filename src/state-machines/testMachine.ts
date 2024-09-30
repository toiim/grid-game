import { createMachine, setup } from 'xstate'

const subState = createMachine({
  initial: 'hello',
  states: {
    hello: {
      entry: () => {
        console.log('substate machine is running...')
      },
      on: {
        CONVERSE: 'conversation',
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
