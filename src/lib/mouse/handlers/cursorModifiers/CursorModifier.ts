import type { VectorArray3 } from "../../../Matrix"

export interface CursorModifier {
  readonly alignedPosition: VectorArray3
  add: (addingvVector: VectorArray3) => void
  reset: (initialPosition: VectorArray3) => void
}
