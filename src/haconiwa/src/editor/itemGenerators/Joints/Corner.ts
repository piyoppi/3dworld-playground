import { Coordinate } from "../../../../../lib/Coordinate.js"
import { LineEdge } from "../../../../../lib/lines/lineEdge.js"
import { Vec3 } from "../../../../../lib/Matrix.js"
import { Renderer } from "../../../../../lib/Renderer.js"
import { RenderingObject } from "../../../../../lib/RenderingObject.js"
import type { RenderingObjectBuilder } from "../../../../../lib/RenderingObjectBuilder"
import type { Joint } from "./Joint"

export class Corner<T extends RenderingObject> implements Joint<T> {
  #edges: LineEdge[] = []
  #width = 1
  #coordinate: Coordinate = new Coordinate()
  #fragmentCoordinate: Coordinate = new Coordinate()
  #fragmentRenderingObject: T | null = null
  #original: T | null = null
  #disposed = false

  constructor() {
    this.#coordinate.rotateX(-Math.PI / 2)
  }

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
    if (edges.length !== 2) {
      throw new Error(`The count of connections (${edges.length}) is invalid. Corner must have at least 2 edges.`)
    }

    this.#edges = edges

    if (!this.#coordinate.parent) {
      this.#edges[0].addChildCoordinate(this.#coordinate)
      this.#edges[0].addChildCoordinate(this.#fragmentCoordinate)
    }
  }

  setWidth(width: number) {
    this.#width = width
  }

  getOffset() {
    return (this.#width / 2) * Math.tan(this.getAngle() / 2)
  }

  updateRenderingObject(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    this.removeCornerRenderingItem(renderer)

    if (this.#original) {
      if (!this.#fragmentRenderingObject) {
        const renderingObj = this.#original.clone() as T
        this.#fragmentRenderingObject = renderingObj
        renderer.addItem(this.#fragmentCoordinate, renderingObj)
      }

      const itemScale = this.getOffset() / this.#original.size[2]
      this.#fragmentCoordinate.scale([1, 1, itemScale])
      this.#fragmentCoordinate.z = -(this.#original.size[2] * itemScale) / 2

      if (!this.isAcuteRelation()) {
        this.#fragmentCoordinate.mirrorX()
      } else {
        this.#fragmentCoordinate.resetMirror()
      }
    }

    const cornerRenderingObj = this.makeCornerRenderingObject(builder)
    renderer.addItem(this.#coordinate, cornerRenderingObj)
  }

  dispose(renderer: Renderer<T>) {
    this.#disposed = true

    this.removeCornerRenderingItem(renderer)

    if (renderer.renderingObjectFromCoordinate(this.#fragmentCoordinate)) {
      renderer.removeItem(this.#fragmentCoordinate)
      this.#fragmentRenderingObject = null
    }
  }

  private isAcuteRelation() {
    return Vec3.dotprod(this.#edges[0].xAxis, this.#edges[1].zAxis) < 0
  }

  private getAngle() {
    return Math.PI - Math.acos(Vec3.dotprod(this.#edges[0].xAxis, this.#edges[1].xAxis))
    return Vec3.dotprod(this.#edges[0].xAxis, this.#edges[1].xAxis) < 0 ?
      Math.PI - Math.acos(Vec3.dotprod(this.#edges[0].xAxis, this.#edges[1].xAxis)) :
      Math.acos(Vec3.dotprod(this.#edges[0].xAxis, this.#edges[1].xAxis))
  }

  private removeCornerRenderingItem(renderer: Renderer<T>) {
    if (renderer.renderingObjectFromCoordinate(this.#coordinate)) {
      renderer.removeItem(this.#coordinate)
    }
  }

  private makeCornerRenderingObject(builder: RenderingObjectBuilder<T>) {
    const angle = this.getAngle()
    let startAngle = -angle

    if (this.isAcuteRelation()) {
      startAngle += Math.PI + angle
    }

    const obj = builder.makeCircle(this.#width / 2, angle, startAngle, {r: 255, g: 0, b: 0})

    return obj
  }
}
