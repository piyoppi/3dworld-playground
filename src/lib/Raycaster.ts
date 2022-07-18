import { Camera } from './Camera.js';
import { Item } from './Item.js'
import { Mat4, Vec3 } from './Matrix.js';
import { Ray } from './Ray.js'

export class Raycaster {
  #camera: Camera
  #targetItems: Array<Item>

  constructor(camera: Camera) {
    this.#camera = camera
    this.#targetItems = []
  }

  addTarget(item: Item) {
    this.#targetItems.push(item)
  }

  getRay(normalizedX: number, normalizedY: number): Ray {
    const vec = [normalizedX, normalizedY] as const

    let vector = Mat4.mulGlVec3(this.#camera.projectionMatrixInverse, [...vec, 0.9])
    vector = Mat4.mulGlVec3(this.#camera.coordinate.matrix, vector)

    let vector2 = Mat4.mulGlVec3(this.#camera.projectionMatrixInverse, [...vec, 1])
    vector2 = Mat4.mulGlVec3(this.#camera.coordinate.matrix, vector2)

    const ray = Vec3.subtract(vector2, vector)

    return {
      position: vector,
      direction: Vec3.normalize(ray)
    }
  }

  check(normalizedX: number, normalizedY: number) {
    const ray = this.getRay(normalizedX, normalizedY)

    return this.#targetItems.filter(item => item.checkColidedToRay(ray))
  }
}
