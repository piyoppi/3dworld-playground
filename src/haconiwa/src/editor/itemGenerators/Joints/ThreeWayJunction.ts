import { RenderingObject } from "../../../../../lib/RenderingObject";
import { Joint } from "./Joint";
import { Coordinate } from "../../../../../lib/Coordinate.js"
import { LineEdge } from "../../../../../lib/lines/lineEdge.js"
import { Renderer } from "../../../../../lib/Renderer.js"
import { RenderingObjectBuilder } from "../../../../../lib/RenderingObjectBuilder";
import { Vec3, VectorArray3 } from "../../../../../lib/Matrix.js"

export class ThreeWayJunction<T extends RenderingObject> implements Joint<T> {
  #coordinate: Coordinate = new Coordinate()
  #edges: LineEdge[] = []
  #disposed = false
  #original: T | null = null
  #junctionCoordinate: Coordinate = new Coordinate()
  #width = 1

  get coordinate() {
    return this.#coordinate
  }

  get edgeCount() {
    return this.#edges.length
  }

  get disposed() {
    return this.#disposed
  }

  setRenderingObjects(renderingObjects: T[]) {
    if (renderingObjects.length !== 1) {
      throw new Error(`The count of RenderingObjects (${renderingObjects.length}) is invalid. Corner must have 1 RenderingObjects.`)
    }

    this.#original = renderingObjects[0]
  }

  setEdges(edges: LineEdge[]) {
    if (edges.length !== 3) {
      throw new Error(`The count of connections (${edges.length}) is invalid. Corner must have at least 3 edges.`)
    }

    this.#edges = edges

    if (!this.#coordinate.parent) {
      this.#edges[0].addChildCoordinate(this.#coordinate)
      this.#edges[0].addChildCoordinate(this.#junctionCoordinate)
    }
  }

  setWidth(width: number) {
    this.#width = width
  }

  getOffset() {
    const angle = Math.min(
      Math.abs(Math.acos(Vec3.dotprod(this.#edges[0].xAxis, this.#edges[1].xAxis))),
      Math.abs(Math.acos(Vec3.dotprod(this.#edges[0].xAxis, this.#edges[2].xAxis))),
      Math.abs(Math.acos(Vec3.dotprod(this.#edges[1].xAxis, this.#edges[2].xAxis)))
    )

    return ((this.#width / 2) * Math.sin((Math.PI - angle) / 2)) / Math.sin(angle / 2)
  }

  updateRenderingObject(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    this.removeJunctionPolygone(renderer)

    const offset = this.getOffset()
    const points = [
      [0, 0, 0],
      [this.#width / 2, 0, -offset],
      [-this.#width / 2, 0, -offset],
    ] as VectorArray3[]

    const renderingObj = builder.makePolygones(points, {r: 255, g: 0, b: 0})
    renderer.addItem(this.#junctionCoordinate, renderingObj)
  }

  dispose(renderer: Renderer<T>) {
    this.#disposed = true

    this.removeJunctionPolygone(renderer)
  }

  private get jointPosition() {
    return this.#edges[0].position
  }

  private removeJunctionPolygone(renderer: Renderer<T>) {
    if (renderer.renderingObjectFromCoordinate(this.#junctionCoordinate)) {
      renderer.removeItem(this.#junctionCoordinate)
    }
  }
}
