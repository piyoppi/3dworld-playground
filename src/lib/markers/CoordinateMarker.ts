import { Coordinate } from "../Coordinate.js"
import type { Raycaster } from "../Raycaster.js"
import type { MouseControllable } from "../mouse/MouseControllable"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder'
import type { Renderer } from "../Renderer"
import type { Marker } from "./Marker"

import { DirectionalMarker, RenderingParameters as DirectionalMarkerRenderingParameters } from  './DirectionalMarker.js'

type RenderingParameters = {
  x: DirectionalMarkerRenderingParameters,
  y: DirectionalMarkerRenderingParameters,
  z: DirectionalMarkerRenderingParameters,
}

export class CoordinateMarker implements Marker {
  #parentCoordinate: Coordinate = new Coordinate()

  #xAxisMarker: DirectionalMarker
  #yAxisMarker: DirectionalMarker
  #zAxisMarker: DirectionalMarker

  constructor(norm: number, radius: number, parentCoordinate: Coordinate) {
    this.#xAxisMarker = new DirectionalMarker(norm, radius, [1, 0, 0], parentCoordinate)
    this.#yAxisMarker = new DirectionalMarker(norm, radius, [0, 1, 0], parentCoordinate)
    this.#zAxisMarker = new DirectionalMarker(norm, radius, [0, 0, 1], parentCoordinate)

    this.#xAxisMarker.setRenderingParameters({color: {r: 255, g: 0, b: 0}})
    this.#yAxisMarker.setRenderingParameters({color: {r: 0, g: 255, b: 0}})
    this.#zAxisMarker.setRenderingParameters({color: {r: 0, g: 0, b: 255}})
  }

  get parentCoordinate() {
    return this.#parentCoordinate
  }

  get coliders() {
    return [
      ...this.#xAxisMarker.coliders,
      ...this.#yAxisMarker.coliders,
      ...this.#zAxisMarker.coliders,
    ]
  }

  get handlers() {
    return [
      ...this.#xAxisMarker.handlers,
      ...this.#yAxisMarker.handlers,
      ...this.#zAxisMarker.handlers
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

  setRenderingParameters(parameters: RenderingParameters) {
    this.#xAxisMarker.setRenderingParameters(parameters.x)
    this.#yAxisMarker.setRenderingParameters(parameters.y)
    this.#zAxisMarker.setRenderingParameters(parameters.z)
  }

  attachRenderingObjects<T>(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    const disposers = [
      this.#xAxisMarker.attachRenderingObjects(builder, renderer),
      this.#yAxisMarker.attachRenderingObjects(builder, renderer),
      this.#zAxisMarker.attachRenderingObjects(builder, renderer)
    ]

    return () => {
      disposers.forEach(disposer => disposer())
    }
  }
}
