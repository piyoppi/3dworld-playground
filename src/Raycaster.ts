import { Camera } from './Camera.js';
import { Item } from './Item.js'
import { Mat4, VectorArray3, Vec4, VectorArray4 } from './Matrix.js';

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

  getRay(normalizedX: number, normalizedY: number): VectorArray3 {
    const vec: VectorArray3 = [normalizedX, normalizedY, 0]
    const transform = Mat4.mulAll([
      this.#camera.coordinate.matrixInverse,
      this.#camera.projectionMatrixInverse,
    ])
    const vector = Vec4.normalize(Mat4.mulVec3(transform, vec))

    return vector.slice(0, 3) as VectorArray3
  }

  check(x: number, y: number) {
    //this.#targetItems.forEach(item => {
    //  item.checkColidedToRay(vec)
    //})
  }
}
