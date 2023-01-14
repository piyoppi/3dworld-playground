import { BallColider } from "../Colider.js"
import { Coordinate } from "../Coordinate.js"
import { MouseControllable } from "../mouse/MouseControllable.js"
import { Raycaster } from "../Raycaster.js"
import { HandledColiders } from "./HandledColiders.js"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder'
import type { RGBColor } from "../helpers/color"
import type { Renderer } from "../Renderer"
import type { SingleMarker, MarkerRenderable } from "./Marker"

export class CenterMarker implements SingleMarker, MarkerRenderable {
  #parentCoordinate: Coordinate = new Coordinate()
  #markerCoordinate = new Coordinate()
  #handledColiders: HandledColiders
  #radius: number
  #colider: BallColider

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

  get markerCoordinates() {
    return [this.#markerCoordinate]
  }

  get handlers() {
    return this.#handledColiders.handlers
  }

  get coliders() {
    return [this.#colider]
  }

  addHandler(handler: MouseControllable) {
    this.#handledColiders.addHandler({colider: this.#colider, handled: handler})
  }

  attach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#handledColiders.attach(raycaster, interactionHandler)
  }

  detach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#handledColiders.detach(raycaster, interactionHandler)
  }

  setParentCoordinate(coordinate: Coordinate) {
    this.#parentCoordinate = coordinate
    this.#colider.parentCoordinate = this.#parentCoordinate

    this.#parentCoordinate.addChild(this.#markerCoordinate)
  }

  attachRenderingObject<T>(color: RGBColor, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    renderer.addItem(this.#markerCoordinate, builder.makeSphere(this.#radius, color))
  }
}
