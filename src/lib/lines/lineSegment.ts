import { Line } from "./line.js"
import { Vec3, VectorArray3 } from "../Matrix.js"

export class LineSegment implements Line {
  #start: VectorArray3
  #end: VectorArray3
  #length: number

  constructor(start: VectorArray3, end: VectorArray3) {
    this.#start = start
    this.#end = end
    this.#length = Vec3.norm(Vec3.subtract(this.#end, this.#start))
  }

  get length() {
    return this.#length
  }

  getPosition(t: number) {
    return Vec3.add(Vec3.mulScale(this.#start, (1 - t)), Vec3.mulScale(this.#end, t))
  }
}
