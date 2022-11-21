import { Coordinate } from "../Coordinate.js"
import { Vec3, VectorArray3 } from "../Matrix.js"
import { CallbackFunctions } from '../CallbackFunctions.js'
import type { Line } from "./line"

export class LineEdge {
  #coordinate: Coordinate
  #updatedCallbacks = new CallbackFunctions<() => void>()
  #tValue: number
  #parent: Line

  constructor(position: VectorArray3, t: 0 | 1, parent: Line) {
    this.#coordinate = new Coordinate()
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

  get t() {
    return this.#tValue
  }

  get parent() {
    return this.#parent
  }

  get xAxis() {
    return this.#coordinate.xAxis
  }

  get yAxis() {
    return this.#coordinate.yAxis
  }

  get zAxis() {
    return this.#coordinate.zAxis
  }

  addChildCoordinate(coordinate: Coordinate) {
    this.#coordinate.addChild(coordinate)
  }

  setUpdateCallback(func: () => void) {
    this.#updatedCallbacks.add(func)
  }

  updateCoordinate(position: VectorArray3) {
    //
    //       z
    //       ￪
    //  x <- o---line---o -> x
    //       :          ￬
    //       :          z
    //       :          :
    //   t : 0   ....   1
    //
    let direction = this.#parent.getDirection(this.#tValue)

    if (Vec3.norm(direction) < 0.1) {
      direction = [0, 0, 1]
    }

    if (this.#tValue === 0) {
      direction = Vec3.reverse(direction)
    }

    this.#coordinate.setDirectionZAxis(direction, position)
    this.#updatedCallbacks.call()
  }
}
