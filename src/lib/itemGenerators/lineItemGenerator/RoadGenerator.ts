import type { Renderer } from "../../Renderer"
import type { Line } from "../../lines/line"

export class RoadGenerator<T> {
  #renderer: Renderer<T>

  constructor(renderer: Renderer<T>) {
    this.#renderer = renderer
  }

  update(line: Line) {

  }
}
