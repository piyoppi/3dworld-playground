import { Coordinate } from "../../../../../lib/Coordinate.js"
import { LineEdge } from "../../../../../lib/lines/lineEdge.js"
import { Renderer } from "../../../../../lib/Renderer.js"
import { RenderingObject } from "../../../../../lib/RenderingObject.js"
import type { RenderingObjectBuilder } from "../../../../../lib/RenderingObjectBuilder"
import type { Joint } from "./Joint"

export class NoneJoint<T extends RenderingObject> implements Joint<T> {
  #coordinate: Coordinate = new Coordinate()

  get coordinate() {
    return this.#coordinate
  }

  get edgeCount() {
    return 0
  }

  get disposed() {
    return false
  }

  setRenderingObjects(_: T[]) {

  }

  setEdges(_: LineEdge[]) {

  }

  setWidth(_: number) {

  }

  getOffset() {
    return 0
  }

  updateRenderingObject(_builder: RenderingObjectBuilder<T>, _renderer: Renderer<T>) {

  }

  dispose(_: Renderer<T>) {

  }
}
