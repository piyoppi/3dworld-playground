import { Coordinate } from "../Coordinate.js"
import { MouseControllable } from "../mouse/MouseControllable.js"
import { Raycaster } from "../Raycaster.js"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder'
import type { Renderer } from "../Renderer"
import type { Marker, MarkerRenderable } from "./Marker"
import { RotateMarker } from "./RotateMarker.js"
import { RenderingObject } from "../RenderingObject.js"

export class CoordinateRotationMarker implements Marker, MarkerRenderable {
  #yzPlaneMarker: RotateMarker
  #xzPlaneMarker: RotateMarker
  #xyPlaneMarker: RotateMarker

  constructor(outerRadius: number, innerRadius: number) {
    this.#yzPlaneMarker = new RotateMarker(outerRadius, innerRadius, [0, 0, 0], [1, 0, 0])
    this.#xzPlaneMarker = new RotateMarker(outerRadius, innerRadius, [0, 0, 0], [0, 1, 0])
    this.#xyPlaneMarker = new RotateMarker(outerRadius, innerRadius, [0, 0, 0], [0, 0, 1])
  }

  get markerCoordinates() {
    return [
      ...this.#yzPlaneMarker.markerCoordinates,
      ...this.#xzPlaneMarker.markerCoordinates,
      ...this.#xyPlaneMarker.markerCoordinates,
    ]
  }

  get coliders() {
    return [
      ...this.#yzPlaneMarker.coliders,
      ...this.#xzPlaneMarker.coliders,
      ...this.#xyPlaneMarker.coliders,
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

  setParentCoordinate(coordinate: Coordinate) {
    this.#yzPlaneMarker.setParentCoordinate(coordinate)
    this.#xzPlaneMarker.setParentCoordinate(coordinate)
    this.#xyPlaneMarker.setParentCoordinate(coordinate)
  }

  attachRenderingObject<T extends RenderingObject>(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    this.#yzPlaneMarker.attachRenderingObject({r: 255, g: 0, b: 0}, builder, renderer)
    this.#xzPlaneMarker.attachRenderingObject({r: 0, g: 255, b: 0}, builder, renderer)
    this.#xyPlaneMarker.attachRenderingObject({r: 0, g: 0, b: 255}, builder, renderer)
  }
}
