import { Coordinate } from "../Coordinate.js"
import { MouseControllable } from "../mouse/MouseControllable.js"
import { Raycaster } from "../Raycaster.js"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder'
import type { Renderer } from "../Renderer"
import type { Marker } from "./Marker"
import { RotateMarker } from "./RotateMarker.js"
import { RenderingObject } from "../RenderingObject.js"

export class CoordinateRotationMarker implements Marker {
  #yzPlaneMarker: RotateMarker
  #xzPlaneMarker: RotateMarker
  #xyPlaneMarker: RotateMarker
  #parentCoordinate: Coordinate

  constructor(outerRadius: number, innerRadius: number, parentCoordinate: Coordinate) {
    this.#parentCoordinate = parentCoordinate

    this.#yzPlaneMarker = new RotateMarker(outerRadius, innerRadius, [0, 0, 0], [1, 0, 0], parentCoordinate)
    this.#xzPlaneMarker = new RotateMarker(outerRadius, innerRadius, [0, 0, 0], [0, 1, 0], parentCoordinate)
    this.#xyPlaneMarker = new RotateMarker(outerRadius, innerRadius, [0, 0, 0], [0, 0, 1], parentCoordinate)

    this.#yzPlaneMarker.setRenderingParameters({color: {r: 255, g: 0, b: 0}})
    this.#xzPlaneMarker.setRenderingParameters({color: {r: 0, g: 255, b: 0}})
    this.#xyPlaneMarker.setRenderingParameters({color: {r: 0, g: 0, b: 255}})
  }

  get parentCoordinate() {
    return this.#parentCoordinate
  }

  get coliders() {
    return [
      ...this.#yzPlaneMarker.coliders,
      ...this.#xzPlaneMarker.coliders,
      ...this.#xyPlaneMarker.coliders,
    ]
  }

  get handlers() {
    return [
      ...this.#yzPlaneMarker.handlers,
      ...this.#xzPlaneMarker.handlers,
      ...this.#xyPlaneMarker.handlers
    ]
  }

  addHandlers(yzHandler: MouseControllable, xzHandler: MouseControllable, xyHandler: MouseControllable) {
    this.#yzPlaneMarker.addHandler(yzHandler)
    this.#xzPlaneMarker.addHandler(xzHandler)
    this.#xyPlaneMarker.addHandler(xyHandler)
  }

  attach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#yzPlaneMarker.attach(raycaster, interactionHandler)
    this.#xzPlaneMarker.attach(raycaster, interactionHandler)
    this.#xyPlaneMarker.attach(raycaster, interactionHandler)
  }

  detach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#yzPlaneMarker.detach(raycaster, interactionHandler)
    this.#xzPlaneMarker.detach(raycaster, interactionHandler)
    this.#xyPlaneMarker.detach(raycaster, interactionHandler)
  }

  attachRenderingObject<T extends RenderingObject>(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    const disposers = [
      this.#yzPlaneMarker.attachRenderingObjects(builder, renderer),
      this.#xzPlaneMarker.attachRenderingObjects(builder, renderer),
      this.#xyPlaneMarker.attachRenderingObjects(builder, renderer)
    ]

    return () => {
      disposers.forEach(dispose => dispose())
    }
  }
}
