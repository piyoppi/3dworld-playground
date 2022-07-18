import { Coordinate } from "./Coordinate.js"
import { Item } from "./Item.js"
import { Renderer } from "./Renderer.js"
import { RenderingObjectBuilder } from './RenderingObjectBuilder.js'

export class AxisMarker<T> {
  #xAxis: Item
  #yAxis: Item
  #zAxis: Item
  #parentCoordinate: Coordinate

  constructor() {
    this.#xAxis = new Item()
    this.#yAxis = new Item()
    this.#zAxis = new Item()
    this.#xAxis.parentCoordinate.rotateZ(Math.PI / 2)
    this.#zAxis.parentCoordinate.rotateX(Math.PI / 2)

    this.#parentCoordinate = new Coordinate()
    this.setParentCoordinate(new Coordinate())
  }

  setParentCoordinate(coordinate: Coordinate | null = null) {
    this.#parentCoordinate.removeChild(this.#xAxis.parentCoordinate)
    this.#parentCoordinate.removeChild(this.#yAxis.parentCoordinate)
    this.#parentCoordinate.removeChild(this.#zAxis.parentCoordinate)

    if (coordinate) {
      this.#parentCoordinate = coordinate
    }

    this.#parentCoordinate.addChild(this.#xAxis.parentCoordinate)
    this.#parentCoordinate.addChild(this.#yAxis.parentCoordinate)
    this.#parentCoordinate.addChild(this.#zAxis.parentCoordinate)
  }

  attachRenderingObject(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    const xAxisRenderingObject = builder.makeVectorRenderingObject(0.1)
    const yAxisRenderingObject = builder.makeVectorRenderingObject(0.1)
    const zAxisRenderingObject = builder.makeVectorRenderingObject(0.1)

    renderer.addItem(this.#xAxis, xAxisRenderingObject)
    renderer.addItem(this.#yAxis, yAxisRenderingObject)
    renderer.addItem(this.#zAxis, zAxisRenderingObject)
  }
}
