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
import { RenderingObject } from "../RenderingObject.js"

export class CenterMarker implements Marker {
  #parentCoordinate: Coordinate
  #handledColiders: HandledColiders
  #radius: number
  #colider: Colider

  constructor(radius: number) {
    this.#parentCoordinate = new Coordinate()
    this.setParentCoordinate(new Coordinate())
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

  setHandlers(handlers: MouseControllable[]) {
    const handles = handlers.map(handler => ({colider: this.#colider, handled: handler}))

    this.#handledColiders.setHandles(handles)

    return this.#colider
  }

  attach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#handledColiders.attach(raycaster, interactionHandler)
  }

  detach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#handledColiders.detach(raycaster, interactionHandler)
  }

  setParentCoordinate(coordinate: Coordinate) {
    if (coordinate) {
      this.#parentCoordinate = coordinate
      this.#colider = new BallColider(this.#radius, this.#parentCoordinate)
    }
  }

  attachRenderingObject<T extends RenderingObject<T>>(color: RGBColor, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    renderer.addItem(this.#parentCoordinate, builder.makeSphere(this.#radius, color))
  }
}
