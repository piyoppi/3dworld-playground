import { BallColider } from "../Colider.js"
import { Coordinate } from "../Coordinate.js"
import { Item } from "../Item.js"
import { MouseControllable } from "../mouse/MouseDragHandler.js"
import { MouseInteractionHandler } from "../mouse/MouseInteractionHandler.js"
import { Raycaster } from "../Raycaster.js"
import { HandledColiders } from "./Marker.js"
import { Camera } from '../Camera.js'
import { CenterMarkerHandler } from "./handlers/CenterMarkerHandler.js"

export class CenterMarker<T> {
  #parentCoordinate: Coordinate
  #marker: HandledColiders
  #radius: number

  constructor(radius: number) {
    this.#parentCoordinate = new Coordinate()
    this.setParentCoordinate(new Coordinate())
    this.#marker = new HandledColiders()
    this.#radius = radius
  }

  get radius() {
    return this.#radius
  }

  setColider(raycaster: Raycaster, interactionHandler: MouseInteractionHandler, handler: MouseControllable) {
    const colider = new BallColider(this.#radius, this.#parentCoordinate)
    const handle = {colider, handled: handler}

    this.#marker.setColider(raycaster, interactionHandler, [colider], [handle])
  }

  setParentCoordinate(coordinate: Coordinate) {
    if (coordinate) {
      this.#parentCoordinate = coordinate
    }
  }
}

export const attachCenterMarkerToItem = (marker: CenterMarker<never>, item: Item, raycaster: Raycaster, mouseHandler: MouseInteractionHandler, scale: number, camera: Camera) => {
  marker.setParentCoordinate(item.parentCoordinate)
  marker.setColider(
    raycaster,
    mouseHandler,
    new CenterMarkerHandler(item, [1, 0, 0], [0, 0, 1], scale, camera),
  )
}
