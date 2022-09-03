import { BallColider } from "../Colider.js"
import { Coordinate } from "../Coordinate.js"
import { MouseControllable } from "../mouse/MouseControllable.js"
import { Raycaster } from "../Raycaster.js"
import { HandledColiders } from "./HandledColiders.js"
import type { MouseHandlers } from "../mouse/MouseHandlers"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder'
import type { RGBColor } from "../helpers/color"
import type { Renderer } from "../Renderer"
import type { Marker } from "./Marker"

export class CenterMarker implements Marker {
  #parentCoordinate: Coordinate
  #handledColiders: HandledColiders
  #radius: number

  constructor(radius: number) {
    this.#parentCoordinate = new Coordinate()
    this.setParentCoordinate(new Coordinate())
    this.#handledColiders= new HandledColiders()
    this.#radius = radius
  }

  get radius() {
    return this.#radius
  }

  get parentCoordinate() {
    return this.#parentCoordinate
  }

  get handler() {
    return this.#handledColiders.handlers[0]?.handled || null
  }

  setHandler(handler: MouseControllable) {
    const colider = new BallColider(this.#radius, this.#parentCoordinate)
    const handle = {colider, handled: handler}

    this.#handledColiders.setHandles([handle])

    return handle
  }

  attach(raycaster: Raycaster, interactionHandler: MouseHandlers) {
    this.#handledColiders.attach(raycaster, interactionHandler)
  }

  detach(raycaster: Raycaster, interactionHandler: MouseHandlers) {
    this.#handledColiders.detach(raycaster, interactionHandler)
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
