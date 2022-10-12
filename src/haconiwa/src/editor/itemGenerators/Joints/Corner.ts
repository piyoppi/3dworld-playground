import { VectorArray3 } from "../../../../../lib/Matrix"
import { RenderingObject } from "../../../../../lib/RenderingObject"
import { RenderingObjectBuilder } from "../../../../../lib/RenderingObjectBuilder"
import { Joint } from "./Joint"

export class Corner<T> implements Joint<T> {
  #directions: VectorArray3[] = []
  #width = 1

  setConnectedDirections(directions: VectorArray3[]) {
    if (directions.length > 1) {
      throw new Error('Too many connections.')
    }

    this.#directions = directions
  }

  setWidth(width: number) {
    this.#width = width
  }

  getOffset() {
    return 0
  }

  makeRenderingObject(builder: RenderingObjectBuilder<T>) {

  }
}
