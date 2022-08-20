import { BallColider } from "../Colider.js"
import { Coordinate } from "../Coordinate.js"
import { MouseControllable } from "../mouse/MouseControllable.js"
import { MouseHandlers } from "../mouse/MouseInteractionHandler.js"
import { Raycaster } from "../Raycaster.js"
import { HandledColiders } from "./HandledColiders.js"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder.js'
import type { RGBColor } from "../helpers/color.js"
import type { Renderer } from "../Renderer.js"
import { Marker } from "./Marker.js"

export class CenterMarker implements Marker {
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

  setHandle(raycaster: Raycaster, interactionHandler: MouseHandlers, handler: MouseControllable) {
    const colider = new BallColider(this.#radius, this.#parentCoordinate)
    const handle = {colider, handled: handler}

    this.#marker.setHandles(raycaster, interactionHandler, [handle])
  }

  removeHandle(raycaster: Raycaster, interactionHandler: MouseHandlers) {
    this.#marker.removeHandles(raycaster, interactionHandler)
  }

  setParentCoordinate(coordinate: Coordinate) {
    if (coordinate) {
      this.#parentCoordinate = coordinate
    }
  }

  attachRenderingObject<T>(color: RGBColor, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    renderer.addItem(this.#parentCoordinate, builder.makeSphere(this.#radius, color))
  }
}
