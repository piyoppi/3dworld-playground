import { Line } from "./line.js"
import { Vec3, VectorArray3 } from "../Matrix.js"

export class LineSegment implements Line {
  #start: VectorArray3
  #end: VectorArray3
  #length: number
  #direction: VectorArray3

  constructor(start: VectorArray3, end: VectorArray3) {
    this.#start = start
    this.#end = end
    const lineSegmentVector = Vec3.subtract(this.#end, this.#start)
    this.#length = Vec3.norm(lineSegmentVector)
    this.#direction = Vec3.normalize(lineSegmentVector)
  }

  get length() {
    return this.#length
  }

  getPosition(t: number) {
    return Vec3.add(Vec3.mulScale(this.#start, (1 - t)), Vec3.mulScale(this.#end, t))
  }

  getDirection(_: number) {
    return this.#direction
  }
}
