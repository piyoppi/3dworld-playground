import { Coordinate } from "./Coordinate.js"

export class Item {
  #parentCoordinate: Coordinate

  constructor() {
    this.#parentCoordinate = Coordinate.create([this])
  }

  set parentCoordinate(value) {
    this.#parentCoordinate = value
  }

  get parentCoordinate() {
    return this.#parentCoordinate
  }
}
