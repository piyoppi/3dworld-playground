import { BoxColider } from "./Colider.js"
import { Coordinate } from "./Coordinate.js"
import { Item } from "./Item.js"
import { Renderer } from "./Renderer.js"
import { RenderingObjectBuilder } from './RenderingObjectBuilder.js'

export class AxisMarker<T> {
  #xAxis: Item
  #yAxis: Item
  #zAxis: Item
  #norm: number
  #parentCoordinate: Coordinate

  constructor() {
    this.#xAxis = new Item()
    this.#yAxis = new Item()
    this.#zAxis = new Item()
    this.#xAxis.parentCoordinate.rotateZ(-Math.PI / 2)
    this.#zAxis.parentCoordinate.rotateX(Math.PI / 2)
    this.#norm = 0.1

    this.#xAxis.parentCoordinate.x = this.#norm / 2
    this.#yAxis.parentCoordinate.y = this.#norm / 2
    this.#zAxis.parentCoordinate.z = this.#norm / 2

    this.#parentCoordinate = new Coordinate()
    this.setParentCoordinate(new Coordinate())
  }

  get xItem() {
    return this.#xAxis
  }

  get yItem() {
    return this.#yAxis
  }

  get zItem() {
    return this.#zAxis
  }

  setColider(radius: number) {
    const xColider = new BoxColider(radius, this.#norm, radius, this.#xAxis.parentCoordinate)
    const yColider = new BoxColider(radius, this.#norm, radius, this.#yAxis.parentCoordinate)
    const zColider = new BoxColider(radius, this.#norm, radius, this.#zAxis.parentCoordinate)

    this.#xAxis.addColider(xColider)
    this.#yAxis.addColider(yColider)
    this.#zAxis.addColider(zColider)

    return [this.#xAxis, this.#yAxis, this.#zAxis]
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
    const xAxisRenderingObject = builder.makeVector(this.#norm, {r: 255, g: 0, b: 0})
    const yAxisRenderingObject = builder.makeVector(this.#norm, {r: 0, g: 255, b: 0})
    const zAxisRenderingObject = builder.makeVector(this.#norm, {r: 0, g: 0, b: 255})

    renderer.addItem(this.#xAxis, xAxisRenderingObject)
    renderer.addItem(this.#yAxis, yAxisRenderingObject)
    renderer.addItem(this.#zAxis, zAxisRenderingObject)
  }
}
