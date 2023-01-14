import { Coordinate } from "../../lib/Coordinate.js"
import { Renderer } from "../../lib/Renderer.js"

export class HaconiwaRenderer<T> {
  #renderer: Renderer<T>
  #beforeRenderCallback: (() => void) | null = null
  #width: number
  #height: number

  constructor(renderer: Renderer<T>, width: number, height: number) {
    this.#renderer = renderer
    this.#width = width
    this.#height = height

    const lightCoordinate = new Coordinate()
    lightCoordinate.y = 1
    lightCoordinate.lookAt([0, 0, 0])
    renderer.addLight(lightCoordinate)

    this.initialize()
  }

  get width() {
    return this.#width
  }

  get height() {
    return this.#height
  }

  get renderer() {
    return this.#renderer
  }

  setBeforeRenderCallback(callback: () => void) {
    this.#beforeRenderCallback = callback
  }

  resize(width: number, height: number) {
    this.#width = width
    this.#height = height
    this.#renderer.initialize(this.#width, this.#height)
  }

  mount() {
    this.#renderer.mount()
  }

  private initialize() {
    this.#renderer.initialize(this.#width, this.#height)

    this.#renderer.setRenderingLoop(() => this.#renderingLoop())
  }

  #renderingLoop() {
    if (this.#beforeRenderCallback) this.#beforeRenderCallback()
    this.#renderer.render()
  }
}
