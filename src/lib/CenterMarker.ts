import { BallColider } from "./Colider.js"
import { Coordinate } from "./Coordinate.js"
import { Item } from "./Item.js"
import { MouseControllable } from "./MouseDragHandler.js"
import { MouseInteractionHandler } from "./MouseInteractionHandler.js"
import { Raycaster } from "./Raycaster.js"
import { Marker } from "./Marker.js"

export class CenterMarker<T> {
  #parentCoordinate: Coordinate
  #marker: Marker

  constructor() {
    this.#parentCoordinate = new Coordinate()
    this.setParentCoordinate(new Coordinate())
    this.#marker = new Marker()
  }

  setColider(raycaster: Raycaster, interactionHandler: MouseInteractionHandler, handler: MouseControllable, radius: number) {
    const colider = new BallColider(radius, this.#parentCoordinate)
    const handle = {colider, handled: handler}

    this.#marker.setColider(raycaster, interactionHandler, [colider], [handle])
  }

  setParentCoordinate(coordinate: Coordinate) {
    if (coordinate) {
      this.#parentCoordinate = coordinate
    }
  }
}
