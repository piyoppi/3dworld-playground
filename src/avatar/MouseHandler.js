export class MouseHandler {
  #position
  #renderingAreaSize
  #updated

  constructor(boundingWidth, boundingHeight) {
    this.#position = [0, 0]   
    this.#renderingAreaSize = [boundingWidth, boundingHeight]
    this.#updated = false
  }

  get updated() {
    return this.#updated
  }

  setPosition(x, y) {
    this.#position[0] = x
    this.#position[1] = y
    this.#updated = true
  }

  getPosition() {
    this.#updated = false
    return this.#position
  }

  getNormalizedPosition() {
    this.#updated = false
    return [
       (this.#position[0] / this.#renderingAreaSize[0]) * 2 - 1,
      -(this.#position[1] / this.#renderingAreaSize[1]) * 2 + 1
    ]
  }
}
