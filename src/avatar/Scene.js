import * as THREE from 'three'

export class Scene {
  #scene

  constructor() {
    this.#scene = new THREE.Scene()
  }

  add(renderingObject) {
    this.#scene.add(renderingObject.raw)
  }

  get raw() {
    return this.#scene
  }
}
