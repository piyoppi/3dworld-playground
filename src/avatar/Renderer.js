import * as THREE from 'three'

export class Renderer {
  #renderer
  #scene
  #camera

  constructor(scene, camera) {
    this.#renderer = new THREE.WebGLRenderer({ antialias: true })
    this.#scene = scene
    this.#camera = camera
  }

  get scene() {
    return this.#scene
  }

  initialize(width, height) {
    this.#renderer.setSize( window.innerWidth, window.innerHeight )
    this.#renderer.setPixelRatio( window.devicePixelRatio );
  }

  render() {
    this.#renderer.render(this.#scene.raw, this.#camera.raw)
  }

  setRenderingLoop(callable) {
    this.#renderer.setAnimationLoop(() => {
      callable()
      this.render()
    })
  }

  mount() {
    document.body.appendChild( this.#renderer.domElement )
  }

  resize(width, height) {
    this.#camera.setAspect(window.innerWidth / window.innerHeight)
    this.#renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
