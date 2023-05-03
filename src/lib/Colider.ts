import { Coordinate } from './Coordinate.js'
import { Vec3, Mat3, Mat4, VectorArray3 } from './Matrix.js'
import { Ray } from './Ray.js'
import { v4 as uuidv4 } from 'uuid'

export interface Colider {
  readonly uuid: string
  checkRay(ray: Ray): number
  checkColided(colider: Colider): boolean
  checkColidedDistance(colider: Colider): VectorArray3 | null
  enabled: boolean
}

export interface CoordinatedColider extends Colider {
  readonly parentCoordinate: Coordinate
}

export class ColiderBase {
  #uuid: string
  #enabled = true

  constructor() {
    this.#uuid = uuidv4()
  }

  get uuid() {
    return this.#uuid
  }

  get enabled() {
    return this.#enabled
  }

  set enabled(value: boolean) {
    this.#enabled = value
  }
}

export class InfiniteColider extends ColiderBase {
  #parentCoordinate = new Coordinate()

  constructor() {
    super()
  }

  get parentCoordinate() {
    return this.#parentCoordinate
  }

  checkRay(_ray: Ray): number {
    return 0.01
  }

  checkColided(_: Colider): boolean {
    return false
  }

  checkColidedDistance(_: Colider): VectorArray3 | null {
    return null
  }
}

export class BallColider extends ColiderBase implements CoordinatedColider {
  #radius = 0
  #parentCoordinate: Coordinate

  constructor(radius: number, parentCoordinate: Coordinate) {
    super()
    this.#radius = radius
    this.#parentCoordinate = parentCoordinate
  }

  get radius() {
    return this.#radius
  }

  get parentCoordinate() {
    return this.#parentCoordinate
  }

  checkRay(ray: Ray): number {
    if (!this.enabled) return -1

    const pos = this.#parentCoordinate.getGlobalPosition()
    const s = Vec3.subtract(ray.position, pos)
    const a = 1
    const b = 2 * Vec3.dotprod(s, ray.direction)
    const c = Math.pow(Vec3.norm(s), 2) - Math.pow(this.#radius, 2)

    const d = Math.pow(b, 2) - 4 * a * c

    return (d >= 0) ? Math.min((-b + d) / 2 * a, (-b - d) / 2 * a) : -1
  }

  checkColided(colider: Colider): boolean {
    if (colider instanceof BallColider) {
      return !!this.checkColidedWithBall(colider)
    }

    return false
  }

  checkColidedDistance(colider: Colider): VectorArray3 | null {
    if (colider instanceof BallColider) {
      return this.checkColidedWithBall(colider)
    }

    return null
  }

  private checkColidedWithBall(pair: BallColider): VectorArray3 | null  {
    const radiusColided = pair.radius + this.#radius
    const vec = Vec3.subtract(pair.parentCoordinate.getGlobalPosition(), this.#parentCoordinate.getGlobalPosition())
    const vecNorm = Vec3.norm(vec)

    if (radiusColided < vecNorm) {
      return null
    }

    return Vec3.mulScale(Vec3.normalize(vec), (radiusColided - vecNorm))
  }
}

export class BoxColider extends ColiderBase implements CoordinatedColider {
  #halfDimensions: VectorArray3 = [0, 0, 0]
  #parentCoordinate: Coordinate

  constructor(width: number, height: number, depth: number, parentCoordinate: Coordinate) {
    super()
    this.#halfDimensions = [
      width / 2.0,
      height / 2.0,
      depth / 2.0
    ]
    this.#parentCoordinate = parentCoordinate
  }

  get parentCoordinate() {
    return this.#parentCoordinate
  }

  checkRay(ray: Ray): number {
    if (!this.enabled) return -1

    const transformToTargetItem = this.#parentCoordinate.getTransformMatrixFromWorldToCoordinate()
    const transformedRay = {
      position: Mat4.mulGlVec3(transformToTargetItem, ray.position),
      direction: Vec3.normalize(Mat3.mulVec3(Mat4.convertToDirectionalTransformMatrix(transformToTargetItem), ray.direction))
    }

    const tRange = this.#halfDimensions.map((dimension, i) => {
      const tempt1 = (dimension - transformedRay.position[i]) / transformedRay.direction[i]
      const tempt2 = (-dimension - transformedRay.position[i]) / transformedRay.direction[i]
      const t1 = Math.min(tempt1, tempt2)
      const t2 = Math.max(tempt1, tempt2)

      return [t1, t2]
    })

    const xyRange = [
      Math.max(tRange[0][0], tRange[1][0]),
      Math.min(tRange[0][1], tRange[1][1])
    ]

    if (xyRange[0] > xyRange[1]) return -1

    const xyzRange = [
      Math.max(xyRange[0], tRange[2][0]),
      Math.min(xyRange[1], tRange[2][1])
    ]

    if (xyzRange[0] > xyzRange[1]) return -1

    if (Math.max(xyzRange[0], xyzRange[1]) < 0) return -1

    return Math.min(xyRange[0], xyzRange[1])
  }

  checkColided(pair: Colider): boolean {
    if (pair instanceof BoxColider) {
      return this.checkColidedWithBox(pair)
    }

    return false
  }

  checkColidedDistance(_: Colider): VectorArray3 {
    return [0, 0, 0]
  }

  private checkColidedWithBox(pair: BoxColider): boolean {
    const distance = Vec3.subtract(this.parentCoordinate.getGlobalPosition(), pair.parentCoordinate.getGlobalPosition())
    const coord = this.parentCoordinate
    const pairCoord = pair.parentCoordinate

    const pairDimensions = [
      Vec3.mulScale(coord.xAxis, this.#halfDimensions[0]),
      Vec3.mulScale(coord.yAxis, this.#halfDimensions[1]),
      Vec3.mulScale(coord.zAxis, this.#halfDimensions[2])
    ]

    const diff1 = this.#halfDimensions[0] + Vec3.dotprod(pairDimensions[0], coord.xAxis) + Vec3.dotprod(pairDimensions[1], coord.xAxis) + Vec3.dotprod(pairDimensions[2], coord.xAxis) - Vec3.dotprod(distance, coord.xAxis)
    if (diff1 < 0) return false 

    const diff2 = this.#halfDimensions[1] + Vec3.dotprod(pairDimensions[0], coord.yAxis) + Vec3.dotprod(pairDimensions[1], coord.yAxis) + Vec3.dotprod(pairDimensions[2], coord.yAxis) - Vec3.dotprod(distance, coord.yAxis)
    if (diff2 < 0) return false 

    const diff3 = this.#halfDimensions[2] + Vec3.dotprod(pairDimensions[0], coord.zAxis) + Vec3.dotprod(pairDimensions[1], coord.zAxis) + Vec3.dotprod(pairDimensions[2], coord.zAxis) - Vec3.dotprod(distance, coord.zAxis)
    if (diff3 < 0) return false 

    const dimensions = [
      Vec3.mulScale(coord.xAxis, this.#halfDimensions[0]),
      Vec3.mulScale(coord.yAxis, this.#halfDimensions[1]),
      Vec3.mulScale(coord.zAxis, this.#halfDimensions[2])
    ]

    const diff4 = pair.#halfDimensions[0] + Vec3.dotprod(dimensions[0], pairCoord.xAxis) + Vec3.dotprod(dimensions[1], pairCoord.xAxis) + Vec3.dotprod(dimensions[2], pairCoord.xAxis) - Vec3.dotprod(distance, pairCoord.xAxis)
    if (diff4 < 0) return false 

    const diff5 = pair.#halfDimensions[1] + Vec3.dotprod(dimensions[0], pairCoord.yAxis) + Vec3.dotprod(dimensions[1], pairCoord.yAxis) + Vec3.dotprod(dimensions[2], pairCoord.yAxis) - Vec3.dotprod(distance, pairCoord.yAxis)
    if (diff5 < 0) return false 

    const diff6 = pair.#halfDimensions[2] + Vec3.dotprod(dimensions[0], pairCoord.zAxis) + Vec3.dotprod(dimensions[1], pairCoord.zAxis) + Vec3.dotprod(dimensions[2], pairCoord.zAxis) - Vec3.dotprod(distance, pairCoord.zAxis)
    if (diff6 < 0) return false 

    const separatedAxis7 = Vec3.cross(coord.xAxis, pairCoord.xAxis)
    const diff7 = Vec3.dotprod(dimensions[1], separatedAxis7) + Vec3.dotprod(dimensions[2], separatedAxis7) + Vec3.dotprod(pairDimensions[1], separatedAxis7) + Vec3.dotprod(pairDimensions[2], separatedAxis7) - Math.abs(Vec3.dotprod(distance, separatedAxis7))
    if (diff7 < 0) return false 

    const separatedAxis8 = Vec3.cross(coord.xAxis, pairCoord.yAxis)
    const diff8 = Vec3.dotprod(dimensions[1], separatedAxis8) + Vec3.dotprod(dimensions[2], separatedAxis8) + Vec3.dotprod(pairDimensions[0], separatedAxis8) + Vec3.dotprod(pairDimensions[2], separatedAxis8) - Math.abs(Vec3.dotprod(distance, separatedAxis8))
    if (diff8 < 0) return false

    const separatedAxis9 = Vec3.cross(coord.xAxis, pairCoord.zAxis)
    const diff9 = Vec3.dotprod(dimensions[1], separatedAxis9) + Vec3.dotprod(dimensions[2], separatedAxis9) + Vec3.dotprod(pairDimensions[0], separatedAxis9) + Vec3.dotprod(pairDimensions[1], separatedAxis9) - Math.abs(Vec3.dotprod(distance, separatedAxis9))
    if (diff9 < 0) return false

    const separatedAxis10 = Vec3.cross(coord.yAxis, pairCoord.xAxis)
    const diff10 = Vec3.dotprod(dimensions[0], separatedAxis10) + Vec3.dotprod(dimensions[2], separatedAxis10) + Vec3.dotprod(pairDimensions[1], separatedAxis10) + Vec3.dotprod(pairDimensions[2], separatedAxis10) - Math.abs(Vec3.dotprod(distance, separatedAxis10))
    if (diff10 < 0) return false

    const separatedAxis11 = Vec3.cross(coord.yAxis, pairCoord.yAxis)
    const diff11 = Vec3.dotprod(dimensions[0], separatedAxis11) + Vec3.dotprod(dimensions[2], separatedAxis11) + Vec3.dotprod(pairDimensions[0], separatedAxis11) + Vec3.dotprod(pairDimensions[2], separatedAxis11) - Math.abs(Vec3.dotprod(distance, separatedAxis11))
    if (diff11 < 0) return false

    const separatedAxis12 = Vec3.cross(coord.yAxis, pairCoord.zAxis)
    const diff12 = Vec3.dotprod(dimensions[0], separatedAxis12) + Vec3.dotprod(dimensions[2], separatedAxis12) + Vec3.dotprod(pairDimensions[0], separatedAxis12) + Vec3.dotprod(pairDimensions[1], separatedAxis12) - Math.abs(Vec3.dotprod(distance, separatedAxis12))
    if (diff12 < 0) return false

    const separatedAxis13 = Vec3.cross(coord.zAxis, pairCoord.xAxis)
    const diff13 = Vec3.dotprod(dimensions[0], separatedAxis13) + Vec3.dotprod(dimensions[1], separatedAxis13) + Vec3.dotprod(pairDimensions[1], separatedAxis13) + Vec3.dotprod(pairDimensions[2], separatedAxis13) - Math.abs(Vec3.dotprod(distance, separatedAxis13))
    if (diff13 < 0) return false

    const separatedAxis14 = Vec3.cross(coord.zAxis, pairCoord.yAxis)
    const diff14 = Vec3.dotprod(dimensions[0], separatedAxis14) + Vec3.dotprod(dimensions[1], separatedAxis14) + Vec3.dotprod(pairDimensions[0], separatedAxis14) + Vec3.dotprod(pairDimensions[2], separatedAxis14) - Math.abs(Vec3.dotprod(distance, separatedAxis14))
    if (diff14 < 0) return false

    const separatedAxis15 = Vec3.cross(coord.zAxis, pairCoord.zAxis)
    const diff15 = Vec3.dotprod(dimensions[0], separatedAxis15) + Vec3.dotprod(dimensions[1], separatedAxis15) + Vec3.dotprod(pairDimensions[0], separatedAxis15) + Vec3.dotprod(pairDimensions[1], separatedAxis15) - Math.abs(Vec3.dotprod(distance, separatedAxis15))
    if (diff15 < 0) return false

    return true
  }
}

export class PlaneColider extends ColiderBase implements CoordinatedColider {
  #edgeEvaluator: (distance: number, ray: Ray) => boolean = () => true
  #parentCoordinate: Coordinate
  #norm: VectorArray3
  #inLocal = false

  constructor(parentCoordinate: Coordinate, norm: VectorArray3, inLocal = true) {
    super()
    this.#norm = norm
    this.#parentCoordinate = parentCoordinate
    this.#inLocal = inLocal
  }

  get parentCoordinate() {
    return this.#parentCoordinate
  }

  setEdgeEvaluator(func: (distance: number, ray: Ray) => boolean) {
    this.#edgeEvaluator = func
  }

  checkRay(ray: Ray): number {
    if (!this.enabled) return -1

    const position = this.#parentCoordinate.position
    let normConverted: VectorArray3 = this.#norm

    if (this.#inLocal) {
      const transformToTargetItem = this.#parentCoordinate.getTransformMatrixToWorld()
      normConverted = Vec3.normalize(Mat3.mulVec3(Mat4.convertToDirectionalTransformMatrix(transformToTargetItem), this.#norm))
    }

    const parallel = Vec3.dotprod(normConverted, ray.direction)
    if (Math.abs(parallel) < 0.00001) return -1

    const distance = (Vec3.dotprod(normConverted, Vec3.subtract(position, ray.position))) / parallel

    if (!this.#edgeEvaluator(distance, ray)) return -1

    return distance
  }

  checkColided(_: Colider): boolean {
    return false
  }

  checkColidedDistance(_: Colider): VectorArray3 | null {
    return null
  }
}
