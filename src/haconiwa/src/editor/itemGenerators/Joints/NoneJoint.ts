import { Coordinate } from "../../../../../lib/Coordinate.js"
import { VectorArray3 } from "../../../../../lib/Matrix.js"
import { Renderer } from "../../../../../lib/Renderer.js"
import { RenderingObject } from "../../../../../lib/RenderingObject.js"
import type { RenderingObjectBuilder } from "../../../../../lib/RenderingObjectBuilder"
import type { Joint } from "./Joint"

export class NoneJoint<T extends RenderingObject<unknown>> implements Joint<T> {
  #coordinate: Coordinate = new Coordinate()

  get coordinate() {
    return this.#coordinate
  }

  get directionLength() {
    return 0
  }

  setPosition(position: VectorArray3) {

  }

  setConnectedDirections(_: VectorArray3[]) {

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