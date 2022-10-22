import { Coordinate } from "../../../../../lib/Coordinate.js"
import { Vec3, VectorArray3 } from "../../../../../lib/Matrix.js"
import { Renderer } from "../../../../../lib/Renderer.js"
import { RenderingObject } from "../../../../../lib/RenderingObject.js"
import type { RenderingObjectBuilder } from "../../../../../lib/RenderingObjectBuilder"
import type { Joint } from "./Joint"

export class Corner<T extends RenderingObject<unknown>> implements Joint<T> {
  #directions: VectorArray3[] = []
  #width = 1
  #coordinate: Coordinate = new Coordinate()
  #originalPosition: VectorArray3 = [0, 0, 0]

  constructor() {
    this.#coordinate.rotateX(-Math.PI / 2)
  }

  get coordinate() {
    return this.#coordinate
  }

  get directionLength() {
    return this.#directions.length
  }

  setConnectedDirections(directions: VectorArray3[]) {
    if (directions.length > 2) {
      throw new Error('Too many connections.')
    }

    this.#directions = directions
  }

  setPosition(position: VectorArray3) {
    this.#originalPosition = position

    this.adjustPosition()
  }

  setWidth(width: number) {
    this.#width = width

    this.adjustPosition()
  }

  getOffset() {
    return 0
  }

  updateRenderingObject(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    this.removeRenderingItem(renderer)

    const renderingObj = this.makeRenderingObject(builder)

    renderer.addItem(this.#coordinate, renderingObj)
  }

  dispose(renderer: Renderer<T>) {
    this.removeRenderingItem(renderer)
  }

  private adjustPosition() {
    this.#coordinate.position = this.#originalPosition
    this.#coordinate.z -= this.#width
  }

  private removeRenderingItem(renderer: Renderer<T>) {
    if (renderer.renderingObjectFromCoordinate(this.#coordinate)) {
      renderer.removeItem(this.#coordinate)
    }
  }

  private makeRenderingObject(builder: RenderingObjectBuilder<T>) {
    const angle = Math.acos(Vec3.dotprod(this.#directions[0], this.#directions[1]))
    console.log(this.#directions[0], this.#directions[1], angle)

    const obj = builder.makeCircle(this.#width, angle, {r: 255, g: 0, b: 0})

    return obj
  }
}
