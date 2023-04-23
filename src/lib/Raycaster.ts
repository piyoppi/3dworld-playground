import { Camera } from './Camera.js';
import { Colider } from './Colider.js';
import { Mat4, Vec3 } from './Matrix.js';
import { Ray } from './Ray.js'
import { ReadOnlyRaycaster } from './ReadOnlyRaycaster.js';

type ColidedItem<T> = {
  colider: Colider,
  item: T
}

export class ColidedDetails<T extends Colider> {
  #colider: T
  #distance: number
  #ray: Ray

  constructor(colider: T, distance: number, ray: Ray) {
    this.#colider = colider
    this.#distance = distance
    this.#ray = ray
  }

  get colider() {
    return this.#colider
  }

  get position() {
    return Vec3.add(this.#ray.position, Vec3.mulScale(this.#ray.direction, this.#distance))
  }

  get direction() {
    return this.#ray.direction
  }

  get distance() {
    return this.#distance
  }
}

export class Coliders<T extends Colider> extends Array<T> {
  has(...targets: T[]) {
    return this.some(item => targets.some(target => item.uuid === target.uuid))
  }
}

export class Raycaster<T extends Colider = Colider> {
  #camera: Camera
  #colidedDetails: Array<ColidedDetails<T>>
  #colidedColiders = new Coliders<T>()
  #targetColiders: Array<T>

  constructor(camera: Camera) {
    this.#camera = camera
    this.#targetColiders = []
    this.#colidedDetails = []
  }

  get colidedColiders() {
    return this.#colidedColiders
  }

  get colidedDetails() {
    return this.#colidedDetails
  }

  get hasColided() {
    return this.#colidedColiders.length > 0
  }

  getReadonly(): ReadOnlyRaycaster<T> {
    return new ReadOnlyRaycaster(this)
  }

  addTarget(colider: T) {
    this.#targetColiders.push(colider)
  }

  removeTarget(colider: T) {
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

    this.#colidedColiders = new Coliders(...colided.map(item => item.colider))
    this.#colidedDetails = colided.map(item => new ColidedDetails<T>(item.colider, item.distance, ray))

    return this.#colidedColiders
  }

  clear() {
    this.#colidedColiders.length = 0
    this.#colidedDetails.length = 0
  }
}
