import * as THREE from 'three'

export class Scene {
  #scene

  constructor() {
    this.#scene = new THREE.Scene()
  }

  add(coordinate) {
    this.#scene.add(coordinate.raw)
  }

  get raw() {
    return this.#scene
  }
}
