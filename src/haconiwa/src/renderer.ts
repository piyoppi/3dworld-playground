import { Coordinate } from "../../lib/Coordinate.js"
import { Renderer } from "../../lib/Renderer.js"

export class HaconiwaRenderer<T> {
  #renderer: Renderer<T>

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

  #setRenderingLoop() {

  }
}
