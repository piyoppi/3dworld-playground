import { Coordinate } from './Coordinate.js'
import { Vec3, Mat3, Mat4, VectorArray3 } from './Matrix.js'
import { Ray } from './Ray.js'

export interface Colider {
  checkRay(ray: Ray): number
  checkColider(colider: Colider): VectorArray3
}

export class InfiniteColider implements Colider {
  checkRay(_ray: Ray): number {
    return 0.01
  }

  checkColider(colider: Colider): VectorArray3 {
    return [0, 0, 0]
  }
}

export class BallColider implements Colider {
  #radius = 0
  #parentCoordinate: Coordinate

  constructor(radius: number, parentCoordinate: Coordinate) {
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
    const pos = this.#parentCoordinate.getGlobalPosition()
    const s = Vec3.subtract(ray.position, pos)
    const a = 1
    const b = 2 * Vec3.dotprod(s, ray.direction)
    const c = Math.pow(Vec3.norm(s), 2) - Math.pow(this.#radius, 2)

    const d = Math.pow(b, 2) - 4 * a * c

    return (d >= 0) ? Math.min((-b + d) / 2 * a, (-b - d) / 2 * a) : -1
  }

  checkColider(colider: Colider): VectorArray3 {
    if (colider instanceof BallColider) {
      const radiusColided = colider.radius + this.#radius
      const vec = Vec3.subtract(colider.parentCoordinate.getGlobalPosition(), this.#parentCoordinate.getGlobalPosition())
      const vecNorm = Vec3.norm(vec)

      if (radiusColided <= vecNorm) {
        return [0, 0, 0]
      }

      return Vec3.mulScale(Vec3.normalize(vec), (radiusColided - vecNorm))
    }

    return [0, 0, 0]
  }
}

export class BoxColider implements Colider {
  #halfDimensions: VectorArray3 = [0, 0, 0]
  #parentCoordinate: Coordinate

  constructor(width: number, height: number, depth: number, parentCoordinate: Coordinate) {
    this.#halfDimensions = [
      width / 2.0,
      height / 2.0,
      depth / 2.0
    ]
    this.#parentCoordinate = parentCoordinate
  }

  checkRay(ray: Ray): number {
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

  checkColider(colider: Colider): VectorArray3 {
    return [0, 0, 0]
  }
}

export class PlaneColider implements Colider {
  #norm: VectorArray3
  #position: VectorArray3

  constructor(position: VectorArray3, norm: VectorArray3) {
    this.#position = position
    this.#norm = norm
  }

  checkRay(ray: Ray): number {
    const parallel = Vec3.dotprod(this.#norm, ray.direction)

    if (Math.abs(parallel) < 0.001) return -1

    const distance = (Vec3.dotprod(this.#norm, Vec3.subtract(this.#position, ray.position))) / parallel

    return distance
  }

  checkColider(colider: Colider): VectorArray3 {
    return [0, 0, 0]
  }
}
