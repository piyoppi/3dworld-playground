import { VectorArray3 } from "../../Matrix.js"
import { AlignmentAdapter } from './AlignmentAdapter.js'

export class NoneAlignment implements AlignmentAdapter {
  #currentPosition: VectorArray3

  constructor() {
    this.#currentPosition = [0, 0, 0]
  }

  get alignedPosition(): VectorArray3 {
    return this.#currentPosition
  }

  add(addingVector: VectorArray3) {
    this.#currentPosition[0] += addingVector[0]
    this.#currentPosition[1] += addingVector[1]
    this.#currentPosition[2] += addingVector[2]
  }

  reset(position: VectorArray3) {
    this.#currentPosition = position
  }
}
