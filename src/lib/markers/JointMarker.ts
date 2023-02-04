import { CenterMarker } from './CenterMarker.js'
import { BallColider, CoordinatedColider } from "../Colider.js"
import { Coordinate } from '../Coordinate.js'
import type { RGBColor } from "../helpers/color"
import type { Renderer } from "../Renderer"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder'
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import { MarkerRenderable, SingleMarker } from './Marker.js'
import { MouseControllable } from '../mouse/MouseControllable.js'
import { Raycaster } from "../Raycaster.js"

export class JointColider extends BallColider {}

export class JointMarker implements SingleMarker, MarkerRenderable {
  #radius: number
  #marker: CenterMarker

  constructor(radius: number, parentCoordinate: Coordinate) {
    const colider = new JointColider(radius, parentCoordinate)
    this.#marker = new CenterMarker(colider)

    this.#radius = radius
  }

  get coliders() {
    return this.#marker.coliders
  }

  get handlers() {
    return this.#marker.handlers
  }

  get markerCoordinates() {
    return this.#marker.markerCoordinates
  }

  addHandler(handler: MouseControllable) {
    this.#marker.addHandler(handler)
  }

  attach(raycaster: Raycaster<CoordinatedColider>, interactionHandler: MouseControlHandles) {
    this.#marker.attach(raycaster, interactionHandler)
  }

  detach(raycaster: Raycaster<CoordinatedColider>, interactionHandler: MouseControlHandles) {
    this.#marker.detach(raycaster, interactionHandler)
  }

  attachRenderingObject<T>(color: RGBColor, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    this.#marker.attachRenderingObject(color, this.#radius, builder, renderer)
  }
}
