import * as THREE from 'three'

export class Camera {
  #camera

  constructor(fov, aspect, near, far) {
    this.#camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  }

  get raw() {
    return this.#camera
  }

  setAspect(aspect) {
    this.#camera.aspect = aspect
    this.#camera.updateProjectionMatrix()
  }
}
