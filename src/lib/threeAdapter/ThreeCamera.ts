import { PerspectiveCamera } from 'three'
import { Camera } from '../Camera.js'
import { Coordinate } from '../Coordinate.js'
import { syncCoordinate } from './ThreeSyncCoordinate.js'

export class ThreeCamera implements Camera {
  #camera: PerspectiveCamera
  #coordinate = new Coordinate()

  constructor(fov: number, aspect: number, near: number, far: number) {
    this.#camera = new PerspectiveCamera(fov, aspect, near, far)
    this.#camera.position.y = 1
    this.#camera.lookAt(0, 0, 0)
    this.#coordinate.setUpdateCallback(() => {
      syncCoordinate(this.#coordinate, this.#camera)
    })
  }

  get raw() {
    return this.#camera
  }

  get coordinate() {
    return this.#coordinate
  }

  setAspect(aspect: number) {
    if (!this.#camera) return

    this.#camera.aspect = aspect
    this.#camera.updateProjectionMatrix()
  }

  get projectionMatrix() {
    return this.#camera.projectionMatrix.toArray()
  }

  get projectionMatrixInverse() {
    return this.#camera.projectionMatrixInverse.toArray()
  }
}
