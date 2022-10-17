import type { LineGenerator } from "./LineGenerator"
import { VectorArray3 } from "../../../Matrix.js"
import { LineSegment } from "../../../lines/lineSegment.js"

export class LineSegmentGenerator implements LineGenerator {
  #start: VectorArray3 = [0, 0, 0]
  #end: VectorArray3 = [0, 0, 0]

  setStartPosition(position: VectorArray3) {
    this.#start = position
  }

  setEndPosition(position: VectorArray3) {
    this.#end = position
  }

  getLine() {
    return new LineSegment(this.#start, this.#end)
  }
}
