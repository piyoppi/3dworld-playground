export class RenderingObject {
  #rawRenderingObject

  constructor(rawRenderingObject) {
    this.#rawRenderingObject = rawRenderingObject
  }

  setRawObject(rawRenderingObject) {
    this.#rawRenderingObject = rawRenderingObject
  }

  get raw() {
    return this.#rawRenderingObject
  }
}
