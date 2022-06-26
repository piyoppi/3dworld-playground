import { BallColider } from "./Colider.js"
import { Coordinate } from "./Coordinate.js"
import { VectorArray3 } from "./Matrix.js"

export class Item {
  #parentCoordinate: Coordinate
  #coliders: Array<BallColider>

  constructor() {
    this.#parentCoordinate = Coordinate.create([this])
    this.#coliders = []
  }

  checkColidedToRay(vec: VectorArray3): boolean {
    return this.#coliders.some(colider => colider.checkRay(vec, this.parentCoordinate))
  }

  set parentCoordinate(value) {
    this.#parentCoordinate = value
    value.addItem(this)
  }

  get parentCoordinate() {
    return this.#parentCoordinate
  }
}
