import type { Coordinate } from "../Coordinate"
import type { Marker, MarkerRenderable } from "./Marker"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { MouseControllable } from "../mouse/MouseControllable"
import type { Raycaster } from "../Raycaster.js"
import type { RenderingObject } from "../RenderingObject"
import type { Renderer } from "../Renderer"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder'
import { PlaneMarker } from "./PlaneMarker.js"

export class XYZPlaneMarker implements Marker, MarkerRenderable {
  #yzPlaneMarker: PlaneMarker
  #zxPlaneMarker: PlaneMarker
  #xyPlaneMarker: PlaneMarker

  constructor(size: number, parentCoordinate: Coordinate) {
    this.#yzPlaneMarker = new PlaneMarker(size, [1, 0, 0], parentCoordinate)
    this.#zxPlaneMarker = new PlaneMarker(size, [0, 1, 0], parentCoordinate)
    this.#xyPlaneMarker = new PlaneMarker(size, [0, 0, 1], parentCoordinate)
  }

  get coliders() {
    return [
      ...this.#yzPlaneMarker.coliders,
      ...this.#zxPlaneMarker.coliders,
      ...this.#xyPlaneMarker.coliders,
    ]
  }

  get markerCoordinates() {
    return [
      ...this.#yzPlaneMarker.markerCoordinates,
      ...this.#zxPlaneMarker.markerCoordinates,
      ...this.#xyPlaneMarker.markerCoordinates,
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

  setParentCoordinate(coordinate: Coordinate) {
    this.#xyPlaneMarker.setParentCoordinate(coordinate)
    this.#yzPlaneMarker.setParentCoordinate(coordinate)
    this.#zxPlaneMarker.setParentCoordinate(coordinate)
  }

  addHandlers(yzHandler: MouseControllable, zxHandler: MouseControllable, xyHandler: MouseControllable) {
    this.#yzPlaneMarker.addHandler(yzHandler)
    this.#zxPlaneMarker.addHandler(zxHandler)
    this.#xyPlaneMarker.addHandler(xyHandler)
  }

  attachRenderingObject<T extends RenderingObject>(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    this.#yzPlaneMarker.attachRenderingObject({r: 255, g: 0, b: 0}, builder, renderer)
    this.#zxPlaneMarker.attachRenderingObject({r: 0, g: 255, b: 0}, builder, renderer)
    this.#xyPlaneMarker.attachRenderingObject({r: 0, g: 0, b: 255}, builder, renderer)
  }
}
