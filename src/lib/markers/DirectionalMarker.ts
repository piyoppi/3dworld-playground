import { BoxColider, Colider } from "../Colider.js"
import { Coordinate } from "../Coordinate.js"
import { Item } from "../Item.js"
import { HandledColiders } from "./HandledColiders.js"
import { Vec3, VectorArray3 } from "../Matrix.js"
import type { MouseControllable } from "../mouse/MouseControllable.js"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { Raycaster } from "../Raycaster.js"
import type { Renderer } from "../Renderer.js"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder.js'
import type { RGBColor } from "../helpers/color.js"
import type { Marker } from "./Marker"

export class DirectionalMarker implements Marker {
  #direction
  #norm: number
  #radius: number
  #parentCoordinate: Coordinate
  #handledColiders: HandledColiders
  #colider: Colider

  constructor(norm: number, radius: number, direction: VectorArray3) {
    this.#direction = new Item()
    this.#norm = norm
    this.#radius = radius

    this.#direction.parentCoordinate.setDirectionYAxis(direction, Vec3.mulScale(direction, norm / 2))

    this.#parentCoordinate = new Coordinate()
    this.#handledColiders = new HandledColiders()
    this.#colider = new BoxColider(this.#radius, this.#norm, this.#radius, this.#direction.parentCoordinate)
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
    this.#parentCoordinate.removeChild(this.#direction.parentCoordinate)

    if (coordinate) {
      this.#parentCoordinate = coordinate
    }

    this.#parentCoordinate.addChild(this.#direction.parentCoordinate)
  }

  attachRenderingObject<T>(color: RGBColor, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    renderer.addItem(this.#direction.parentCoordinate, builder.makeVector(this.#norm, this.#radius, color))
  }
}
