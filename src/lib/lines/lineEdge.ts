import { Vec3, VectorArray3 } from "../Matrix.js"
import type { Line } from "./line"

export class LineEdge {
  #position: VectorArray3
  #tValue: number
  #parent: Line

  constructor(position: VectorArray3, t: number, parent: Line) {
    this.#position = position
    this.#tValue = t
    this.#parent = parent
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

  get parent() {
    return this.#parent
  }

  getTangentVector() {
    return this.#parent.getDirection(this.#tValue)
  }
}
