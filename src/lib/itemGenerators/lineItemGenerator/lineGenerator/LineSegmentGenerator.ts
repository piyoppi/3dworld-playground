import type { VectorArray3 } from "../../../Matrix"
import type { LineGenerator } from "./LineGenerator"
import { LineSegment } from "../../../lines/lineSegment.js"

export class LineSegmentGenerator implements LineGenerator {
  #start: VectorArray3 = [0, 0, 0]
  #end: VectorArray3 = [0, 0, 0]

  setStartPosition(position: VectorArray3) {
    this.#start = position
  }

  setPosition(position: VectorArray3) {
    this.#end = position
  }

  getLine() {
    return new LineSegment(this.#start, this.#end)
  }
}
