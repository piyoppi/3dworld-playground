import type { Coordinate } from "../Coordinate"
import type { Marker } from "./Marker"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { MouseControllable } from "../mouse/MouseControllable"
import type { Raycaster } from "../Raycaster.js"
import type { RenderingObject } from "../RenderingObject"
import type { Renderer } from "../Renderer"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder'
import { PlaneMarker } from "./PlaneMarker.js"

export class XYZPlaneMarker implements Marker {
  #yzPlaneMarker: PlaneMarker
  #zxPlaneMarker: PlaneMarker
  #xyPlaneMarker: PlaneMarker
  #parentCoordinate: Coordinate

  constructor(size: number, parentCoordinate: Coordinate) {
    this.#yzPlaneMarker = new PlaneMarker(size, [1, 0, 0], [0, 1, 0], parentCoordinate)
    this.#zxPlaneMarker = new PlaneMarker(size, [0, 1, 0], [0, 0, 1], parentCoordinate)
    this.#xyPlaneMarker = new PlaneMarker(size, [0, 0, 1], [1, 0, 0], parentCoordinate)

    this.#yzPlaneMarker.setRenderingParameters({color: {r: 255, g: 0, b: 0}})
    this.#zxPlaneMarker.setRenderingParameters({color: {r: 0, g: 255, b: 0}})
    this.#xyPlaneMarker.setRenderingParameters({color: {r: 0, g: 0, b: 255}})

    this.#parentCoordinate = parentCoordinate
  }

  get parentCoordinate() {
    return this.#parentCoordinate
  }

  get coliders() {
    return [
      ...this.#yzPlaneMarker.coliders,
      ...this.#zxPlaneMarker.coliders,
      ...this.#xyPlaneMarker.coliders,
    ]
  }

  get handlers() {
    return [
      ...this.#yzPlaneMarker.handlers,
      ...this.#zxPlaneMarker.handlers,
      ...this.#xyPlaneMarker.handlers
    ]
  }

  attach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#xyPlaneMarker.attach(raycaster, interactionHandler)
    this.#yzPlaneMarker.attach(raycaster, interactionHandler)
    this.#zxPlaneMarker.attach(raycaster, interactionHandler)
  }

  detach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#xyPlaneMarker.detach(raycaster, interactionHandler)
    this.#yzPlaneMarker.detach(raycaster, interactionHandler)
    this.#zxPlaneMarker.detach(raycaster, interactionHandler)
  }

  addHandlers(yzHandler: MouseControllable, zxHandler: MouseControllable, xyHandler: MouseControllable) {
    this.#yzPlaneMarker.addHandler(yzHandler)
    this.#zxPlaneMarker.addHandler(zxHandler)
    this.#xyPlaneMarker.addHandler(xyHandler)
  }

  attachRenderingObjects<T extends RenderingObject>(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    const disposers = [
      this.#yzPlaneMarker.attachRenderingObjects(builder, renderer),
      this.#zxPlaneMarker.attachRenderingObjects(builder, renderer),
      this.#xyPlaneMarker.attachRenderingObjects(builder, renderer)
    ]

    return () => {
      disposers.forEach(disposer => disposer())
    }
  }
}
