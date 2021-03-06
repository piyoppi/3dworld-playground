import { Camera } from './Camera.js';
import { Colider } from './Colider.js';
import { Item } from './Item.js'
import { Mat4, Vec3 } from './Matrix.js';
import { Ray } from './Ray.js'

type ColidedItem<T> = {
  colider: Colider,
  item: T
}

export class Raycaster<T> {
  #camera: Camera
  #targetItems: Array<ColidedItem<T>>
  #colidedColiders: Array<Colider>
  #colidedItems: Array<T>

  constructor(camera: Camera) {
    this.#camera = camera
    this.#targetItems = []
    this.#colidedItems = []
    this.#colidedColiders = []
  }

  get colidedItems() {
    return this.#colidedItems
  }

  get colidedColiders() {
    return this.#colidedColiders
  }

  addTarget(colider: Colider, item: T) {
    this.#targetItems.push({colider, item})
  }

  removeTarget(item: T) {
    this.#targetItems.map((targetItem, index) => targetItem.item === item ? index : -1)
      .filter(index => index >= 0)
      .sort((a, b) => b - a)
      .forEach(index => {
        this.#targetItems.splice(index, 1)
      })
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

    const colided = this.#targetItems
      .map(colidedItem => ({colidedItem, distance: colidedItem.colider.checkRay(ray)}))
      .filter(prop => prop.distance >= 0)
      .sort((a, b) => a.distance - b.distance)
      .map(prop => prop.colidedItem)

    this.#colidedColiders = colided.map(item => item.colider)
    this.#colidedItems = colided.map(item => item.item)

    return this.#colidedItems
  }
}
