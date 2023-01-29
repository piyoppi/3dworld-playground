import { Line } from "./line.js"
import { Vec3, VectorArray3 } from "../Matrix.js"
import { LineEdge } from "./lineEdge.js"
import { CallbackFunctions } from '../CallbackFunctions.js'

export class LineSegment implements Line {
  #edges: LineEdge[]
  #start: LineEdge 
  #end: LineEdge
  #length = 0
  #direction: VectorArray3 = [0, 0, 0]
  #updatedCallbacks = new CallbackFunctions<() => void>()

  constructor(start: VectorArray3, end: VectorArray3) {
    this.#start = new LineEdge(start, 0, this)
    this.#end = new LineEdge(end, 1, this)
    this.#start.setUpdateCallback(() => this.#setup())
    this.#end.setUpdateCallback(() => this.#setup())
    this.#edges = [this.#start, this.#end]
    this.#setup()

    this.#edges.forEach(edge => 
      edge.coordinate.setConstraintCallback(() => {
        let updated = false

        this.#edges.forEach(edge => {
          const result = edge.updateCoordinate()
          updated ||= result
        })

        if (updated) {
          this.#updatedCallbacks.call()
        }
      })
    )
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

  setUpdatedCallback(func: () => void) {
    this.#updatedCallbacks.add(func)
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
