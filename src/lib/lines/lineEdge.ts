import type { VectorArray3 } from "../Matrix"
import type { Line } from "./line"

export class LineEdge {
  #position: VectorArray3
  #parent: Line

  constructor(position: VectorArray3, parentLine: Line) {
    this.#position = position
    this.#parent = parentLine
  }

  get position() {
    return this.#position
  }

  set position(value: VectorArray3) {
    this.#position = value
  }

  get parent() {
    return this.#parent
  }
}
