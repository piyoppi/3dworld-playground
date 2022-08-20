import { BoxColider } from "../Colider.js"
import { Coordinate } from "../Coordinate.js"
import { Item } from "../Item.js"
import { HandledColiders } from "./HandledColiders.js"
import { Mat4, Vec3, VectorArray3 } from "../Matrix.js"
import type { MouseControllable } from "../mouse/MouseControllable.js"
import type { MouseHandlers } from "../mouse/MouseHandlers"
import type { Raycaster } from "../Raycaster.js"
import type { Renderer } from "../Renderer.js"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder.js'
import type { RGBColor } from "../helpers/color.js"
import { Marker } from "./Marker.js"

export class DirectionalMarker implements Marker {
  #direction
  #norm: number
  #radius: number
  #parentCoordinate: Coordinate
  #marker: HandledColiders

  constructor(norm: number, radius: number, direction: VectorArray3) {
    this.#direction = new Item()
    this.#norm = norm
    this.#radius = radius

    this.#direction.parentCoordinate.matrix = Mat4.transformYAxis(direction, Vec3.mulScale(direction, norm / 2))

    this.#parentCoordinate = new Coordinate()
    this.#marker = new HandledColiders()
  }

  setHandle(raycaster: Raycaster, interactionHandler: MouseHandlers, handler: MouseControllable) {
    const colider = new BoxColider(this.#radius, this.#norm, this.#radius, this.#direction.parentCoordinate)
    this.#marker.setHandles(raycaster, interactionHandler, [{colider, handled: handler}])
  }

  removeHandle(raycaster: Raycaster, interactionHandler: MouseHandlers) {
    this.#marker.removeHandles(raycaster, interactionHandler)
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
