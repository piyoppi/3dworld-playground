import { Coordinate } from "../../lib/Coordinate.js"
import { Renderer } from "../../lib/Renderer.js"

export class HaconiwaRenderer<T> {
  #renderer: Renderer<T>
  #beforeRenderCallback: (() => void) | null = null

  constructor(renderer: Renderer<T>) {
    this.#renderer = renderer

    const lightCoordinate = new Coordinate()
    lightCoordinate.y = 1
    lightCoordinate.lookAt([0, 0, 0])
    renderer.addLight(lightCoordinate)
  }

  get renderer() {
    return this.#renderer
  }

  setBeforeRenderCallback(callback: () => void) {
    this.#beforeRenderCallback = callback
  }

  initialize(width: number, height: number) {
    this.#renderer.initialize(width, height)

    this.#renderer.setRenderingLoop(() => this.#renderingLoop())

    this.#renderer.mount()
  }

  #renderingLoop() {
    if (this.#beforeRenderCallback) this.#beforeRenderCallback()
    this.#renderer.render()
  }
}
