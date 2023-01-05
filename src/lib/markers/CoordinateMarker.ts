import { Coordinate } from "../Coordinate.js"
import { MouseControllable } from "../mouse/MouseControllable.js"
import { Raycaster } from "../Raycaster.js"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder'
import type { RGBColor } from "../helpers/color"
import type { Renderer } from "../Renderer"
import type { Marker, MarkerRenderable } from "./Marker"

import { DirectionalMarker } from  './DirectionalMarker.js'

export class CoordinateMarker implements Marker, MarkerRenderable {
  #parentCoordinate: Coordinate = new Coordinate()

  #xAxisMarker: DirectionalMarker
  #yAxisMarker: DirectionalMarker
  #zAxisMarker: DirectionalMarker

  constructor(norm: number, radius: number) {
    this.#xAxisMarker = new DirectionalMarker(norm, radius, [1, 0, 0])
    this.#yAxisMarker = new DirectionalMarker(norm, radius, [0, 1, 0])
    this.#zAxisMarker = new DirectionalMarker(norm, radius, [0, 0, 1])
  }

  get parentCoordinate() {
    return this.#parentCoordinate
  }

  get markerCoordinates() {
    return [
      ...this.#xAxisMarker.markerCoordinates,
      ...this.#xAxisMarker.markerCoordinates,
      ...this.#xAxisMarker.markerCoordinates,
    ]
  }

  get coliders() {
    return [
      ...this.#xAxisMarker.coliders,
      ...this.#yAxisMarker.coliders,
      ...this.#zAxisMarker.coliders,
    ]
  }

  addHandlers(xHandler: MouseControllable, yHandler: MouseControllable, zHandler: MouseControllable) {
    this.#xAxisMarker.addHandler(xHandler)
    this.#yAxisMarker.addHandler(yHandler)
    this.#zAxisMarker.addHandler(zHandler)
  }

  attach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#xAxisMarker.attach(raycaster, interactionHandler)
    this.#yAxisMarker.attach(raycaster, interactionHandler)
    this.#zAxisMarker.attach(raycaster, interactionHandler)
  }

  detach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#xAxisMarker.detach(raycaster, interactionHandler)
    this.#yAxisMarker.detach(raycaster, interactionHandler)
    this.#zAxisMarker.detach(raycaster, interactionHandler)
  }

  setParentCoordinate(coordinate: Coordinate) {
    this.#xAxisMarker.setParentCoordinate(coordinate)
    this.#yAxisMarker.setParentCoordinate(coordinate)
    this.#zAxisMarker.setParentCoordinate(coordinate)
  }

  attachRenderingObject<T>(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    this.#xAxisMarker.attachRenderingObject({r: 255, g: 0, b: 0}, builder, renderer)
    this.#yAxisMarker.attachRenderingObject({r: 0, g: 255, b: 0}, builder, renderer)
    this.#zAxisMarker.attachRenderingObject({r: 0, g: 0, b: 255}, builder, renderer)
  }
}
