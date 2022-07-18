import { BoxColider } from "./Colider.js"
import { Coordinate } from "./Coordinate.js"
import { Item } from "./Item.js"
import { Renderer } from "./Renderer.js"
import { RenderingObjectBuilder } from './RenderingObjectBuilder.js'

export class AxisMarker<T> {
  #axes
  #norm: number
  #parentCoordinate: Coordinate

  constructor() {
    this.#axes = [new Item(), new Item(), new Item()]
    this.#axes[0].parentCoordinate.rotateZ(-Math.PI / 2)
    this.#axes[2].parentCoordinate.rotateX(Math.PI / 2)
    this.#norm = 0.1

    this.#axes[0].parentCoordinate.x = this.#norm / 2
    this.#axes[1].parentCoordinate.y = this.#norm / 2
    this.#axes[2].parentCoordinate.z = this.#norm / 2

    this.#parentCoordinate = new Coordinate()
    this.setParentCoordinate(new Coordinate())
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

  setColider(radius: number) {
    return this.#axes.map(axis => new BoxColider(radius, this.#norm, radius, axis.parentCoordinate))
      .forEach((colider, index) => this.#axes[index].addColider(colider))
  }

  setParentCoordinate(coordinate: Coordinate | null = null) {
    this.#axes.forEach(axis => this.#parentCoordinate.removeChild(axis.parentCoordinate))

    if (coordinate) {
      this.#parentCoordinate = coordinate
    }

    this.#axes.forEach(axis => this.#parentCoordinate.addChild(axis.parentCoordinate))
  }

  attachRenderingObject(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    [
      builder.makeVector(this.#norm, {r: 255, g: 0, b: 0}),
      builder.makeVector(this.#norm, {r: 0, g: 255, b: 0}),
      builder.makeVector(this.#norm, {r: 0, g: 0, b: 255})
    ].forEach((renderingObject, index) => renderer.addItem(this.#axes[index], renderingObject))
  }
}
