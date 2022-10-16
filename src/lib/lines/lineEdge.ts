import type { VectorArray3 } from "../Matrix"
import type { Line } from "./line"

export class LineEdge {
  #position: VectorArray3
  #tValue: number

  constructor(position: VectorArray3, t: number) {
    this.#position = position
    this.#tValue = t
  }

  get position() {
    return this.#position
  }

  set position(value: VectorArray3) {
    this.#position = value
  }

  get t() {
    return this.#tValue
  }
}
