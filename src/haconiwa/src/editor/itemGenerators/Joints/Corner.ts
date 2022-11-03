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
    this.#coordinate.y = 0.1
  }

  private removeRenderingItem(renderer: Renderer<T>) {
    const renderingObj = renderer.renderingObjectFromCoordinate(this.#coordinate)
    if (renderingObj) {
      renderer.removeItem(this.#coordinate)
    }
  }

  private makeRenderingObject(builder: RenderingObjectBuilder<T>) {
    const angle = (Math.PI) - Math.acos(Vec3.dotprod(this.#directions[0], this.#directions[1]))

    const obj = builder.makeCircle(this.#width / 4, angle, (Math.PI / 2), {r: 255, g: 0, b: 0})

    return obj
  }
}
