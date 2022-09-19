import { Line } from "./line.js"
import { Vec3, VectorArray3 } from "../Matrix.js"
import { LineEdge } from "./lineEdge.js"

export class LineSegment implements Line {
  #points: VectorArray3[]
  #start: LineEdge 
  #end: LineEdge
  #length = 0
  #direction: VectorArray3 = [0, 0, 0]

  constructor(start: VectorArray3, end: VectorArray3) {
    this.#points = [start, end]
    this.#start = new LineEdge(start, this)
    this.#end = new LineEdge(end, this)
    this.#setup()
  }

  get controlPoints() {
    return this.#points
  }

  get edges(): [LineEdge, LineEdge] {
    return [this.#start, this.#end]
  }

  get length() {
    return this.#length
  }

  setControlPoint(index: number, val: VectorArray3) {
    this.#points[index] = val
    this.#setup()
  }

  getPosition(t: number) {
    return Vec3.add(Vec3.mulScale(this.#points[0], (1 - t)), Vec3.mulScale(this.#points[1], t))
  }

  getDirection(_: number) {
    return this.#direction
  }

  #setup() {
    const lineSegmentVector = Vec3.subtract(this.#points[1], this.#points[0])
    this.#length = Vec3.norm(lineSegmentVector)
    this.#direction = Vec3.normalize(lineSegmentVector)
  }
}
