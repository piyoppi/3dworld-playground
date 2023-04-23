import { RenderingObject } from "../../../../../lib/RenderingObject";
import { Joint, JointDisposeCallback, JointUpdateRenderingObjectResult } from "./Joint";
import { Coordinate } from "../../../../../lib/Coordinate.js"
import { LineEdge } from "../../../../../lib/lines/lineEdge.js"
import { RenderingObjectBuilder } from "../../../../../lib/RenderingObjectBuilder";
import { Mat4, Vec3, VectorArray3 } from "../../../../../lib/Matrix.js"

export class ThreeWayJunction<T extends RenderingObject> implements Joint<T> {
  #coordinate: Coordinate = new Coordinate()
  #edges: LineEdge[] = []
  #disposed = false
  #junctionCoordinate: Coordinate = new Coordinate()
  #complementItemCoordinates: Coordinate[] = [new Coordinate(), new Coordinate()]
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
  }

  setEdges(edges: LineEdge[]) {
    if (edges.length !== 3) {
      throw new Error(`The count of connections (${edges.length}) is invalid. Corner must have at least 3 edges.`)
    }

    this.#edges = edges

    if (!this.#coordinate.parent) {
      this.#edges[0].addChildCoordinate(this.#coordinate)
      this.#edges[0].addChildCoordinate(this.#junctionCoordinate)
      this.#edges[0].addChildCoordinate(this.#complementItemCoordinates[0])
      this.#edges[0].addChildCoordinate(this.#complementItemCoordinates[1])
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

  updateRenderingObject(builder: RenderingObjectBuilder<T>): JointUpdateRenderingObjectResult<T> {
    const offset = this.getOffset()
    const points = [
      [0, 0, 0],
      [this.#width / 2, 0, -offset],
      [-this.#width / 2, 0, -offset],
    ] as VectorArray3[]
    const result = []

    const renderingObj = builder.makePolygones(points, {r: 255, g: 0, b: 0})
    result.push({coordinate: this.#junctionCoordinate, renderingObject: renderingObj})

    if (this.isolated) {
      const mat1 = Mat4.mulAll([
        this.#edges[1].coordinate.getTransformMatrixToWorld(),
        this.#edges[0].coordinate.getTransformMatrixFromWorldToCoordinate()
      ])
      const mat2 = Mat4.mulAll([
        this.#edges[2].coordinate.getTransformMatrixToWorld(),
        this.#edges[0].coordinate.getTransformMatrixFromWorldToCoordinate()
      ])
      const cornersPair1 = [
        Mat4.mulGlVec3(mat1, [-this.#width / 2, 0, -offset]),
        Mat4.mulGlVec3(mat2, [ this.#width / 2, 0, -offset]),
      ]
      const cornersPair2 = [
        Mat4.mulGlVec3(mat2, [-this.#width / 2, 0, -offset]),
        Mat4.mulGlVec3(mat1, [ this.#width / 2, 0, -offset]),
      ]
      const corners = 
        (Vec3.norm(Vec3.subtract(cornersPair1[0], cornersPair1[1])) > Vec3.norm(Vec3.subtract(cornersPair2[0], cornersPair2[1])) ? cornersPair1 : cornersPair2)

      const norms = [
        Vec3.norm(Vec3.subtract(corners[0], [-this.#width / 2, 0, -offset])),
        Vec3.norm(Vec3.subtract(corners[0], [ this.#width / 2, 0, -offset])),
        Vec3.norm(Vec3.subtract(corners[1], [-this.#width / 2, 0, -offset])),
        Vec3.norm(Vec3.subtract(corners[1], [ this.#width / 2, 0, -offset])),
      ]

      const minNorm = Math.min(...norms)

      const corner1normIndex = norms.findIndex((val, index) => (val === minNorm) && (index % 2 === 0))
      const corner2normIndex = norms.findIndex((val, index) => (val === minNorm) && (index % 2 !== 0))

      const corner1 = corner1normIndex >= 0 ? corners[corner1normIndex / 2] : corners[(corner2normIndex - 1) / 2 ? 0 : 1]
      const corner2 = corner2normIndex >= 0 ? corners[(corner2normIndex - 1) / 2] : corners[corner1normIndex / 2 ? 0 : 1]

      const points1 = [[0, 0, 0], [-this.#width / 2, 0, -offset], corner1] as VectorArray3[]
      const points2 = [[0, 0, 0], corner2, [ this.#width / 2, 0, -offset]] as VectorArray3[]

      result.push({coordinate: this.#junctionCoordinate, renderingObject: builder.makePolygones(points1, {r: 255, g: 0, b: 0})})
      result.push({coordinate: this.#junctionCoordinate, renderingObject: builder.makePolygones(points2, {r: 255, g: 0, b: 0})})
    }

    return result
  }

  dispose(callback: JointDisposeCallback): boolean {
    if (callback([
      this.#junctionCoordinate,
      ...this.#complementItemCoordinates,
    ])) {
      this.#disposed = true
    } else {
      return false
    }

    return true
  }

  private get isolated() {
    return Math.abs(Math.acos(Vec3.dotprod(this.#edges[1].xAxis, this.#edges[2].xAxis))) < Math.min(
      Math.abs(Math.acos(Vec3.dotprod(this.#edges[0].xAxis, this.#edges[1].xAxis))),
      Math.abs(Math.acos(Vec3.dotprod(this.#edges[0].xAxis, this.#edges[2].xAxis)))
    )
  }
}
