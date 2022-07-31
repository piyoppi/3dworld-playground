import { Camera } from './Camera.js';
import { Colider } from './Colider.js';
import { Item } from './Item.js'
import { Mat4, Vec3 } from './Matrix.js';
import { Ray } from './Ray.js'

type ColidedItem<T> = {
  colider: Colider,
  item: T
}

export class Raycaster {
  #camera: Camera
  #colidedColiders: Array<Colider>
  #targetColiders: Array<Colider>

  constructor(camera: Camera) {
    this.#camera = camera
    this.#targetColiders = []
    this.#colidedColiders = []
  }

  get colidedColiders() {
    return this.#colidedColiders
  }

  addTarget(colider: Colider) {
    this.#targetColiders.push(colider)
  }

  removeTarget(colider: Colider) {
    this.#targetColiders.map((targetColider, index) => targetColider === colider ? index : -1)
      .filter(index => index >= 0)
      .sort((a, b) => b - a)
      .forEach(index => {
        this.#targetColiders.splice(index, 1)
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

    const colided = this.#targetColiders
      .map(colider => ({colider, distance: colider.checkRay(ray)}))
      .filter(prop => prop.distance >= 0)
      .sort((a, b) => a.distance - b.distance)

    this.#colidedColiders = colided.map(item => item.colider)

    return this.#colidedColiders
  }
}

export class ItemRaycaster<T> {
  #raycaster: Raycaster
  #coliderToItemMap: Map<Colider, T>
  #itemToColiderMap: Map<T, Colider>
  #colidedItems: Array<T>

  constructor(raycaster: Raycaster) {
    this.#coliderToItemMap = new Map()
    this.#itemToColiderMap = new Map()
    this.#colidedItems = []
    this.#raycaster = raycaster
  }

  get colidedItems() {
    return this.#colidedItems
  }

  addTarget(colider: Colider, item: T) {
    this.#coliderToItemMap.set(colider, item)
    this.#itemToColiderMap.set(item, colider)

    this.#raycaster.addTarget(colider)
  }

  removeTarget(item: T) {
    const targetColider = this.#itemToColiderMap.get(item)
    if (!targetColider) return

    this.#raycaster.removeTarget(targetColider)

    this.#coliderToItemMap.delete(targetColider)
    this.#itemToColiderMap.delete(item)
  }

  check(normalizedX: number, normalizedY: number) {
    this.#colidedItems = this.#raycaster.check(normalizedX, normalizedY)
      .map(colider => this.#coliderToItemMap.get(colider))
      .filter((colider): colider is T => !!colider)

    return this.#colidedItems
  }
}
