import { BoxColider } from "./Colider.js"
import { Coordinate } from "./Coordinate.js"
import { Item } from "./Item.js"
import { MouseControllable } from "./MouseDragHandler.js"
import { ControlHandle, MouseInteractionHandler } from "./MouseInteractionHandler.js"
import { Raycaster } from "./Raycaster.js"
import { Renderer } from "./Renderer.js"
import { RenderingObjectBuilder } from './RenderingObjectBuilder.js'
import { Colider } from './Colider.js'
import { Marker } from "./Marker.js"

export class AxisMarker<T> {
  #axes
  #norm: number
  #radius: number
  #parentCoordinate: Coordinate
  #marker: Marker

  constructor(norm: number, radius: number) {
    this.#axes = [new Item(), new Item(), new Item()]
    this.#axes[0].parentCoordinate.rotateZ(-Math.PI / 2)
    this.#axes[2].parentCoordinate.rotateX(Math.PI / 2)
    this.#norm = norm
    this.#radius = radius

    this.#axes[0].parentCoordinate.x = this.#norm / 2
    this.#axes[1].parentCoordinate.y = this.#norm / 2
    this.#axes[2].parentCoordinate.z = this.#norm / 2

    this.#parentCoordinate = new Coordinate()
    this.setParentCoordinate(new Coordinate())
    this.#marker = new Marker()
  }

  get xItem() {
    return this.#axes[0]
  }

  get yItem() {
    return this.#axes[1]
  }

  get zItem() {
    return this.#axes[2]
  }

  get axes() {
    return this.#axes
  }

  get norm() {
    return this.#norm
  }

  get radius() {
    return this.#radius
  }

  setColider(raycaster: Raycaster, interactionHandler: MouseInteractionHandler, handlers: [MouseControllable, MouseControllable, MouseControllable]) {
    const coliders = this.#axes.map(axis => new BoxColider(this.#radius, this.#norm, this.#radius, axis.parentCoordinate))
    const handles = coliders.map((colider, index) => ({colider, handled: handlers[index]}))

    this.#marker.setColider(raycaster, interactionHandler, coliders, handles)
  }

  setParentCoordinate(coordinate: Coordinate) {
    this.#axes.forEach(axis => this.#parentCoordinate.removeChild(axis.parentCoordinate))

    if (coordinate) {
      this.#parentCoordinate = coordinate
    }

    this.#axes.forEach(axis => this.#parentCoordinate.addChild(axis.parentCoordinate))
  }

  attachRenderingObject(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    [
      builder.makeVector(this.#norm, this.#radius, {r: 255, g: 0, b: 0}),
      builder.makeVector(this.#norm, this.#radius, {r: 0, g: 255, b: 0}),
      builder.makeVector(this.#norm, this.#radius, {r: 0, g: 0, b: 255})
    ].forEach((renderingObject, index) => renderer.addItem(this.#axes[index], renderingObject))
  }
}
