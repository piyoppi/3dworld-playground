import { BoxColider, Colider, PlaneColider } from "../Colider.js"
import { Coordinate } from "../Coordinate.js"
import { HandledColiders } from "./HandledColiders.js"
import type { Marker } from "./Marker"
import type { MouseControllable } from "../mouse/MouseControllable.js"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { Raycaster } from "../Raycaster.js"
import type { RGBColor } from "../helpers/color.js"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder.js'
import type { Renderer } from "../Renderer.js"
import { VectorArray3, Vec3, Mat4 } from "../Matrix.js"

export class RotateMarker implements Marker {
  #parentCoordinate = new Coordinate()
  #markerCoordinate = new Coordinate()
  #handledColiders = new HandledColiders()
  #colider: PlaneColider
  #radius: number
  #planePosition: VectorArray3
  #planeNorm: VectorArray3
  #attachedRenderingItem = false

  constructor(radius: number, planePosition: VectorArray3, planeNorm: VectorArray3) {
    this.#radius = radius
    this.#colider = new PlaneColider(planePosition, planeNorm, this.#parentCoordinate)
    this.#planePosition = planePosition
    this.#planeNorm = planeNorm
    this.#markerCoordinate.setDirectionZAxis(planeNorm, planePosition)
    this.createColider()
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

  attach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#handledColiders.attach(raycaster, interactionHandler)
  }

  detach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#handledColiders.detach(raycaster, interactionHandler)
  }

  addHandler(handler: MouseControllable) {
    this.#handledColiders.addHandler({colider: this.#colider, handled: handler})

    console.log(this.#colider.uuid)
    return this.#colider
  }

  setParentCoordinate(coordinate: Coordinate) {
    if (this.#attachedRenderingItem) {
      throw new Error('RenderingItem is already attached')
    }

    this.#parentCoordinate = coordinate
    this.#parentCoordinate.addChild(this.#markerCoordinate)
    this.createColider()
  }

  attachRenderingObject<T>(color: RGBColor, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    renderer.addItem(this.#markerCoordinate, builder.makeCircle(this.#radius, Math.PI * 2, 0, color))
    this.#attachedRenderingItem = true
  }

  private createColider() {
    this.#colider = new PlaneColider(this.#planePosition, this.#planeNorm, this.#parentCoordinate)
    this.#colider.setEdgeEvaluator((dist, ray) => {
      const val = Vec3.norm(
        Vec3.subtract(this.#parentCoordinate.position, Vec3.add(ray.position, Vec3.mulScale(ray.direction, dist)))
      )

      return val < this.#radius
    })
  }
}
