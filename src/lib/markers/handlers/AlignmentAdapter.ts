import { VectorArray3 } from "../../Matrix.js"

export interface AlignmentAdapter {
  readonly alignedPosition: VectorArray3
  add: (addingvVector: VectorArray3) => void
  reset: (initialPosition: VectorArray3) => void
}
