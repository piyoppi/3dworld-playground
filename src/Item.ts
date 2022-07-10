import { Ray } from './Ray.js'
import { Colider } from "./Colider.js"
import { Coordinate } from "./Coordinate.js"
import { v4 as uuidv4 } from 'uuid'

export class Item {
  #parentCoordinate: Coordinate
  #coliders: Array<Colider>
  #uuid: string

  constructor() {
    this.#uuid = uuidv4()
    this.#parentCoordinate = Coordinate.create([this])
    this.#coliders = []
  }

  get uuid() {
    return this.#uuid
  }

  checkColidedToRay(ray: Ray): boolean {
    return this.#coliders.some(colider => colider.checkRay(ray))
  }

  addColider(colider: Colider) {
    this.#coliders.push(colider)
  }

  set parentCoordinate(value) {
    this.#parentCoordinate = value
    value.addItem(this)
  }

  get parentCoordinate() {
    return this.#parentCoordinate
  }
}
