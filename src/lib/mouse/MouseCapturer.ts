import type { VectorArray2 } from "../Matrix"

export class MouseCapturer {
  #position
  #renderingAreaSize
  #updated

  constructor(boundingWidth: number, boundingHeight: number) {
    this.#position = [0, 0]   
    this.#renderingAreaSize = [boundingWidth, boundingHeight]
    this.#updated = false
  }

  get updated() {
    return this.#updated
  }

  setPosition(x: number, y: number) {
    this.#position[0] = x
    this.#position[1] = y
    this.#updated = true
  }

  getPosition() {
    this.#updated = false
    return this.#position
  }

  getNormalizedPosition(): VectorArray2 {
    this.#updated = false
    return [
       (this.#position[0] / this.#renderingAreaSize[0]) * 2 - 1,
      -(this.#position[1] / this.#renderingAreaSize[1]) * 2 + 1
    ]
  }

  capture() {
    window.addEventListener('mousedown', e => { this.setPosition(e.clientX, e.clientY) })
    window.addEventListener('mousemove', e => { this.setPosition(e.clientX, e.clientY) })
    window.addEventListener('wheel', e => { this.setPosition(e.clientX, e.clientY) })
  }
}
