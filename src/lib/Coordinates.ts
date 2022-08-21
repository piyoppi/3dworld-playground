import type { Coordinate } from "./Coordinate";

export class Coordinates {
  #coordinates: Array<Coordinate> = []

  push(coordinate: Coordinate) {
    this.#coordinates.push(coordinate)
  }

  remove(coordinate: Coordinate) {
    const index = this.#coordinates.findIndex(coord => coord.uuid === coordinate.uuid)

    if (index < 0) return false

    this.#coordinates.splice(index, 1)

    return true
  }
}
