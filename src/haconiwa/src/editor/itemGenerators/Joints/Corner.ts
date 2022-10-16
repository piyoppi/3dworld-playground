import { Vec3, VectorArray3 } from "../../../../../lib/Matrix.js"
import type { RenderingObjectBuilder } from "../../../../../lib/RenderingObjectBuilder"
import type { Joint } from "./Joint"

export class Corner implements Joint {
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

  makeRenderingObject<T>(builder: RenderingObjectBuilder<T>) {
    const angle = Math.acos(Vec3.dotprod(this.#directions[0], this.#directions[1]))

    return builder.makeCircle(this.#width, angle, {r: 255, g: 0, b: 0})
  }
}
