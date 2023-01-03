import { Coordinate } from "../Coordinate.js"
import { MouseControllable } from "../mouse/MouseControllable.js"
import { Raycaster } from "../Raycaster.js"
import { HandledColiders } from "./HandledColiders.js"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder'
import type { RGBColor } from "../helpers/color"
import type { Renderer } from "../Renderer"
import type { Marker } from "./Marker"
import { BoxColider } from "../Colider.js"
import { VectorArray3 } from "../Matrix.js"

export class BoxMarker implements Marker {
  #parentCoordinate: Coordinate = new Coordinate()
  #handledColiders: HandledColiders
  #colider: BoxColider 
  #size: VectorArray3
  #attachedRenderingItem = false

  constructor(size: VectorArray3) {
    this.#handledColiders = new HandledColiders()
    this.#colider = new BoxColider(size[0], size[1], size[2], this.#parentCoordinate)
    this.#size = size
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
    renderer.addItem(this.#parentCoordinate, builder.makeBox(this.#size[0], this.#size[1], this.#size[2], color))
    this.#attachedRenderingItem = true
  }
}
