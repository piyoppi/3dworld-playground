import { Coordinate } from './Coordinate.js'
import { Vec3 } from './Matrix.js'
import { Ray } from './Ray.js'
import { showPoint } from './Debugger.js'

export class BallColider {
  #radius = 0
  #parentCoordinate: Coordinate

  constructor(radius: number, parentCoordinate: Coordinate) {
    this.#radius = radius  
    this.#parentCoordinate = parentCoordinate
  }

  checkRay(ray: Ray): boolean {
    const pos = this.#parentCoordinate.getGlobalPosition()
    const s = Vec3.subtract(ray.position, pos)
    const a = 1
    const b = 2 * Vec3.dotprod(s, ray.direction)
    const c = Math.pow(Vec3.norm(s), 2) - Math.pow(this.#radius, 2)

    const d = Math.pow(b, 2) - 4 * a * c

    return (d >= 0)
  }
}
