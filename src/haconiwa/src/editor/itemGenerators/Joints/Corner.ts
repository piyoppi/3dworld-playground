import { Coordinate } from "../../../../../lib/Coordinate.js"
import { LineEdge } from "../../../../../lib/lines/lineEdge.js"
import { Vec3 } from "../../../../../lib/Matrix.js"
import { RenderingObject } from "../../../../../lib/RenderingObject.js"
import type { RenderingObjectBuilder } from "../../../../../lib/RenderingObjectBuilder"
import type { Joint, JointDisposeCallback, JointUpdateRenderingObjectResult } from "./Joint"
import { v4 as uuid } from 'uuid'

export class Corner<T extends RenderingObject> implements Joint<T> {
  #edges: LineEdge[] = []
  #width = 1
  #coordinate: Coordinate = new Coordinate()
  #fragmentCoordinate: Coordinate = new Coordinate()
  #fragmentRenderingObject: T | null = null
  #original: T | null = null
  #disposed = false
  #uuid = uuid()

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

  updateRenderingObject(builder: RenderingObjectBuilder<T>): JointUpdateRenderingObjectResult<T> {
    if (this.disposed) return []

    const result = []

    // Render corner
    const cornerRenderingObj = this.makeCornerRenderingObject(builder)
    result.push({renderingObject: cornerRenderingObj, coordinate: this.#coordinate})

    if (this.#original) {
      if (!this.#fragmentRenderingObject) {
        
        this.#fragmentRenderingObject = this.#original.clone() as T
        result.push({renderingObject: this.#fragmentRenderingObject, coordinate: this.#fragmentCoordinate})
      }

      const itemScale = this.getOffset() / this.#original.size[2]
      console.log('corner', this.#uuid, itemScale)
      this.#fragmentCoordinate.scale([1, 1, itemScale])
      this.#fragmentCoordinate.z = -(this.#original.size[2] * itemScale) / 2

      if (!this.isAcuteRelation()) {
        this.#fragmentCoordinate.mirrorX()
      } else {
        this.#fragmentCoordinate.resetMirror()
      }
    }

    return result
  }

  dispose(callback: JointDisposeCallback) {
    const result = callback([
      this.#coordinate,
      this.#fragmentCoordinate
    ])

    if (result) {
      this.#disposed = true
    } else {
      return false
    }

    this.#fragmentRenderingObject = null

    return true
  }

  private isAcuteRelation() {
    return Vec3.dotprod(this.#edges[0].xAxis, this.#edges[1].zAxis) < 0
  }

  private getAngle() {
    return Math.PI - Math.acos(Vec3.dotprod(this.#edges[0].xAxis, this.#edges[1].xAxis))
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
