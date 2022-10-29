import { Coordinate } from "../Coordinate.js"
import { Mat4, Vec3, VectorArray3 } from "../Matrix.js"
import { CallbackFunctions } from '../CallbackFunctions.js'
import type { Line } from "./line"

export class LineEdge {
  #coordinate: Coordinate
  #updatedCallbacks = new CallbackFunctions<() => void>()
  #tValue: number
  #parent: Line

  constructor(position: VectorArray3, t: 0 | 1, parent: Line) {
    this.#coordinate = new Coordinate()
    this.#coordinate.setUpdateCallback(() => this.handleCoordinateUpdated())
    this.#tValue = t
    this.#parent = parent

    this.updateCoordinate(position)
  }

  get position() {
    return this.#coordinate.position
  }

  get coordinate() {
    return this.#coordinate
  }

  set position(value: VectorArray3) {
    this.updateCoordinate(value)
  }

  get t() {
    return this.#tValue
  }

  get parent() {
    return this.#parent
  }

  getTangentVector() {
    return this.#parent.getDirection(this.#tValue)
  }

  setUpdateCallback(func: () => void) {
    this.#updatedCallbacks.add(func)
  }

  private handleCoordinateUpdated() {
    this.#updatedCallbacks.call()
  }

  private updateCoordinate(position: VectorArray3) {
    const direction = this.#tValue === 0 ? Vec3.reverse(this.#parent.getDirection(this.#tValue)) : this.#parent.getDirection(this.#tValue)

    this.#coordinate.setDirectionYAxis(direction, position)
  }
}
