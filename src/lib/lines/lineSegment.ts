import { Line } from "./line.js"
import { Vec3, VectorArray3 } from "../Matrix.js"
import { LineEdge } from "./lineEdge.js"

export class LineSegment implements Line {
  #edges: LineEdge[]
  #start: LineEdge 
  #end: LineEdge
  #length = 0
  #direction: VectorArray3 = [0, 0, 0]

  constructor(start: VectorArray3, end: VectorArray3) {
    this.#start = new LineEdge(start, 0, this)
    this.#end = new LineEdge(end, 1, this)
    this.#start.setUpdateCallback(() => this.#setup())
    this.#end.setUpdateCallback(() => this.#setup())
    this.#edges = [this.#start, this.#end]
    this.#setup()
  }

  get controlPoints() {
    return []
  }

  get edges(): [LineEdge, LineEdge] {
    return [this.#start, this.#end]
  }

  get length() {
    return this.#length
  }

  setControlPoint(index: number, val: VectorArray3) {
    // noop
  }

  getPosition(t: number) {
    return Vec3.add(Vec3.mulScale(this.#edges[0].position, (1 - t)), Vec3.mulScale(this.#edges[1].position, t))
  }

  getDirection(_: number) {
    return this.#direction
  }

  #setup() {
    const lineSegmentVector = Vec3.subtract(this.#edges[1].position, this.#edges[0].position)
    this.#length = Vec3.norm(lineSegmentVector)
    this.#direction = Vec3.normalize(lineSegmentVector)
  }
}
