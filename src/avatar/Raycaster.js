import * as THREE from 'three'

export class Raycaster {
  #raycaster
  #camera
  #targets
  #cursor

  constructor(targets) {
    this.#raycaster = new THREE.Raycaster()
    this.#cursor = new THREE.Vector2(0, 0)
  }

  setCamera(camera) {
    this.#camera = camera
  }

  setTargets(targets) {
    this.#targets = targets
  }

  getObjects(cursorX, cursorY) {
    this.#cursor.x = cursorX
    this.#cursor.y = cursorY
    this.#raycaster.setFromCamera(this.#cursor, this.#camera.raw)
    return this.#raycaster.intersectObjects(this.#targets)
  }
}
