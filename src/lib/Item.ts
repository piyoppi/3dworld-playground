import { Coordinate } from "./Coordinate.js"
import { v4 as uuidv4 } from 'uuid'

export class Item {
  #parentCoordinate: Coordinate
  #uuid: string

  constructor() {
    this.#uuid = uuidv4()
    this.#parentCoordinate = new Coordinate()
  }

  get uuid() {
    return this.#uuid
  }

  set parentCoordinate(value) {
    this.#parentCoordinate = value
  }

  get parentCoordinate() {
    return this.#parentCoordinate
  }

  clone() {
    return new Item()
  }
}
