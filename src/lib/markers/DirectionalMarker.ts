import { BoxColider } from "../Colider.js"
import { Coordinate } from "../Coordinate.js"
import { HandledColiders } from "./HandledColiders.js"
import { Vec3, VectorArray3 } from "../Matrix.js"
import type { MouseControllable } from "../mouse/MouseControllable.js"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { Raycaster } from "../Raycaster.js"
import type { Renderer } from "../Renderer.js"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder.js'
import type { RGBColor } from "../helpers/color.js"
import type { SingleMarker, MarkerRenderable } from "./Marker"

export class DirectionalMarker implements SingleMarker, MarkerRenderable {
  #norm: number
  #radius: number
  #markerCoordinate = new Coordinate()
  #handledColiders: HandledColiders
  #colider: BoxColider
  #isGlobal = false
  #offsetVec = [0, 0, 0] as VectorArray3

  constructor(norm: number, radius: number, direction: VectorArray3, parentCoordinate: Coordinate, offset: number = 0, isGlobal = false) {
    this.#norm = norm
    this.#radius = radius
    this.#isGlobal = isGlobal
    this.#offsetVec = Vec3.mulScale(direction, offset)
    this.#markerCoordinate.setDirectionYAxis(direction, Vec3.add(Vec3.mulScale(direction, norm / 2), this.#offsetVec))

    if (isGlobal) {
      const updateFunc = () => this.#markerCoordinate.position = Vec3.add(parentCoordinate.getGlobalPosition(), this.#offsetVec)
      parentCoordinate.setUpdateCallback(() => {
        updateFunc()
      })
      updateFunc()
    } else {
      parentCoordinate.addChild(this.#markerCoordinate)
    }

    this.#handledColiders = new HandledColiders()
    this.#colider = new BoxColider(this.#radius, this.#norm, this.#radius, this.#markerCoordinate)
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

  attachRenderingObject<T>(color: RGBColor, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    renderer.addItem(this.#markerCoordinate, builder.makeVector(this.#norm, this.#radius, color))
  }
}
