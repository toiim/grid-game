import { useSelector } from '@xstate/vue'
import type { Ref } from 'vue'
import type { Actor, AnyActorRef, Snapshot } from 'xstate'

function useChildActor(
  parentRef: AnyActorRef | Ref<AnyActorRef>,
  id: string
): { actorRef: Actor; snapshot: Snapshot } {
  const actorRef = useSelector(parentRef, (s) => s.children[id])
  const snapshot = useSelector(actorRef, (s) => s)

  return { actorRef, snapshot }
}
