import { CenterMarker } from './CenterMarker.js'
import { BallColider, CoordinatedColider } from "../Colider.js"
import type { SingleMarker } from './Marker'
import type { Coordinate } from '../Coordinate'
import type { Renderer } from "../Renderer"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder'
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { LineItemConnection } from '../LineItem/LineItemConnection'
import type { MouseControllable } from '../mouse/MouseControllable'
import type { Raycaster } from "../Raycaster"
import type { RenderingObject } from '../RenderingObject'

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

export class JointMarker implements SingleMarker {
  #marker: CenterMarker
  #parentCoordinate: Coordinate
  #connection: LineItemConnection

  constructor(radius: number, connection: LineItemConnection) {
    const parentCoordinate = connection.edge.coordinate
    const colider = new JointColider(radius, parentCoordinate, this)
    this.#parentCoordinate = parentCoordinate
    this.#marker = new CenterMarker(colider)
    this.#connection = connection
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

  attachRenderingObjects<T extends RenderingObject>(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    const dispose = this.#marker.attachRenderingObjects(builder, renderer)

    return () => {
      dispose()
    }
  }
}
