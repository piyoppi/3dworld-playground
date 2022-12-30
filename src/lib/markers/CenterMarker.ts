import { BallColider, Colider } from "../Colider.js"
import { Coordinate } from "../Coordinate.js"
import { MouseControllable } from "../mouse/MouseControllable.js"
import { Raycaster } from "../Raycaster.js"
import { HandledColiders } from "./HandledColiders.js"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder'
import type { RGBColor } from "../helpers/color"
import type { Renderer } from "../Renderer"
import type { Marker } from "./Marker"

export class CenterMarker implements Marker {
  #parentCoordinate: Coordinate = new Coordinate()
  #handledColiders: HandledColiders
  #radius: number
  #colider: BallColider
  #attachedRenderingItem = false

  constructor(radius: number) {
    this.#handledColiders= new HandledColiders()
    this.#radius = radius
    this.#colider = new BallColider(this.#radius, this.#parentCoordinate)
  }

  get radius() {
    return this.#radius
  }

  get parentCoordinate() {
    return this.#parentCoordinate
  }

  get handlers() {
    return this.#handledColiders.handlers
  }

  get colider() {
    return this.#colider
  }

  addHandler(handler: MouseControllable) {
    this.#handledColiders.addHandler({colider: this.#colider, handled: handler})

    return this.#colider
  }

  attach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#handledColiders.attach(raycaster, interactionHandler)
  }

  detach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#handledColiders.detach(raycaster, interactionHandler)
  }

  setParentCoordinate(coordinate: Coordinate) {
    if (this.#attachedRenderingItem) {
      throw new Error('RenderingItem is already attached')
    }

    this.#parentCoordinate = coordinate
    this.#colider.parentCoordinate = this.#parentCoordinate
  }

  attachRenderingObject<T>(color: RGBColor, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    renderer.addItem(this.#parentCoordinate, builder.makeSphere(this.#radius, color))
    this.#attachedRenderingItem = true
  }
}
