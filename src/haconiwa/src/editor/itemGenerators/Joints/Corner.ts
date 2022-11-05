import { Coordinate } from "../../../../../lib/Coordinate.js"
import { LineEdge } from "../../../../../lib/lines/lineEdge.js"
import { Vec3, VectorArray3 } from "../../../../../lib/Matrix.js"
import { Renderer } from "../../../../../lib/Renderer.js"
import { RenderingObject } from "../../../../../lib/RenderingObject.js"
import type { RenderingObjectBuilder } from "../../../../../lib/RenderingObjectBuilder"
import type { Joint } from "./Joint"

export class Corner<T extends RenderingObject<unknown>> implements Joint<T> {
  #edges: LineEdge[] = []
  #width = 1
  #coordinate: Coordinate = new Coordinate()

  constructor() {
    this.#coordinate.rotateX(-Math.PI / 2)
  }

  get coordinate() {
    return this.#coordinate
  }

  get edgeCount() {
    return this.#edges.length
  }

  setEdges(edges: LineEdge[]) {
    if (edges.length > 2) {
      throw new Error('Too many connections.')
    }

    this.#edges = edges

    if (!this.#coordinate.parent) {
      this.#edges[0].addChildCoordinate(this.#coordinate)
    }
  }

  setWidth(width: number) {
    this.#width = width
  }

  getOffset() {
    return (this.#width / 2) * Math.tan(this.getAngle() / 2)
  }

  updateRenderingObject(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    this.removeRenderingItem(renderer)

    const renderingObj = this.makeRenderingObject(builder)

    renderer.addItem(this.#coordinate, renderingObj)
  }

  dispose(renderer: Renderer<T>) {
    this.removeRenderingItem(renderer)
  }

  private getAngle() {
    return (Math.PI - Math.acos(Vec3.dotprod(this.#edges[0].xAxis, this.#edges[1].xAxis)))
  }

  private removeRenderingItem(renderer: Renderer<T>) {
    const renderingObj = renderer.renderingObjectFromCoordinate(this.#coordinate)
    if (renderingObj) {
      renderer.removeItem(this.#coordinate)
    }
  }

  private makeRenderingObject(builder: RenderingObjectBuilder<T>) {
    const angle = this.getAngle()
    let startAngle = -angle

    if (Vec3.dotprod(this.#edges[0].xAxis, this.#edges[1].zAxis) < 0) {
      startAngle += Math.PI + angle
    }

    const obj = builder.makeCircle(this.#width / 2, angle, startAngle, {r: 255, g: 0, b: 0})

    return obj
  }
}
