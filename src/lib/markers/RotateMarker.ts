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
import { VectorArray3, Vec3 } from "../Matrix.js"

export class RotateMarker implements Marker {
  #parentCoordinate = new Coordinate()
  #markerCoordinate = new Coordinate()
  #handledColiders = new HandledColiders()
  #colider: PlaneColider
  #radius: number

  constructor(radius: number, planePosition: VectorArray3, planeNorm: VectorArray3) {
    this.#radius = radius
    this.#colider = new PlaneColider(planePosition, planeNorm)
    this.#colider.setEdgeEvaluator((dist, ray) => Vec3.norm(
      Vec3.subtract(this.#parentCoordinate.position, Vec3.add(ray.position, Vec3.mulScale(ray.direction, dist)))
    ) < this.#radius)
    //this.#colider.setEdgeEvaluator((dist, ray) => {
    //  console.log(this.#parentCoordinate.position, ray.direction, dist, Vec3.mulScale(ray.direction, dist), Vec3.norm(Vec3.subtract(this.#parentCoordinate.position, Vec3.mulScale(ray.direction, dist))))
    //  return true
    //})
    this.#markerCoordinate.setDirectionZAxis(planeNorm, planePosition)
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

    return this.#colider
  }

  setParentCoordinate(coordinate: Coordinate) {
    this.#parentCoordinate = coordinate
    this.#parentCoordinate.addChild(this.#markerCoordinate)
  }

  attachRenderingObject<T>(color: RGBColor, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    renderer.addItem(this.#markerCoordinate, builder.makeCircle(this.#radius, Math.PI * 2, 0, color))
  }
}
