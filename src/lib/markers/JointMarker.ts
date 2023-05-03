import { CenterMarker } from './CenterMarker.js'
import { BallColider, CoordinatedColider } from "../Colider.js"
import type { MarkerRenderable, SingleMarker } from './Marker'
import type { Coordinate } from '../Coordinate'
import type { RGBColor } from "../helpers/color"
import type { Renderer } from "../Renderer"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder'
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { LineItemConnection } from '../LineItem/LineItemConnection'
import type { MouseControllable } from '../mouse/MouseControllable'
import type { Raycaster } from "../Raycaster"

export class JointColider extends BallColider {
  #jointMarker: JointMarker

  constructor(radius: number, parentCoordinate: Coordinate, jointMarker: JointMarker) {
    super(radius, parentCoordinate)

    this.#jointMarker = jointMarker
  }

  get jointMarker() {
    return this.#jointMarker
  }
}

export class JointMarker implements SingleMarker, MarkerRenderable {
  #radius: number
  #marker: CenterMarker
  #parentCoordinate: Coordinate
  #connection: LineItemConnection

  constructor(radius: number, connection: LineItemConnection) {
    const parentCoordinate = connection.edge.coordinate
    const colider = new JointColider(radius, parentCoordinate, this)
    this.#parentCoordinate = parentCoordinate
    this.#marker = new CenterMarker(colider)
    this.#connection = connection

    this.#radius = radius
  }

  get parentCoordinate() {
    return this.#parentCoordinate
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

  get connection() {
    return this.#connection
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

  makeRenderingObject<T>(builder: RenderingObjectBuilder<T>) {
    return this.#marker.makeRenderingObject(builder)
  }

  attachRenderingObject<T>(color: RGBColor, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    this.#marker.attachRenderingObject(color, this.#radius, builder, renderer)
  }
}
