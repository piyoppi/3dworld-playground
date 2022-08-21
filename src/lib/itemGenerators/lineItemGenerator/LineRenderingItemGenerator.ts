import type { Renderer } from "../../Renderer"
import type { LineGenerator } from "./lineGenerator/LineGenerator"
import type { GenerateItemFactory } from "../ItemGenerator"
import type { Coordinate } from "../../Coordinate"
import type { VectorArray3 } from "../../Matrix"
import { LineItemGenerator } from "./LineItemGenerator.js"
import { Coordinates } from "../../Coordinates.js"

export class LineRenderingItemGenerator<T> {
  #lineItemGenerator: LineItemGenerator<Coordinate, T>
  #renderer: Renderer<T>
  #isStart: boolean = false

  constructor(lineItemGenerator: LineItemGenerator<Coordinate, T>, renderer: Renderer<T>) {
    this.#renderer = renderer
    this.#lineItemGenerator = lineItemGenerator
  }

  get renderer() {
    return this.#renderer
  }

  get isStart() {
    return this.#isStart
  }

  get generated() {
    return this.#lineItemGenerator.generated
  }

  start(position: VectorArray3) {
    this.#lineItemGenerator.setStartPosition(position)

    this.#isStart = true
  }

  move(position: VectorArray3) {
    if (!this.#isStart) return

    const result = this.#lineItemGenerator.setEndPosition(position)

    result.transformMatrixes.forEach((matrix, index) => {
      result.items[index].item.matrix = matrix
    })

    result.generatedItems.forEach(generated => {
      this.#renderer.addItem(generated.item, generated.renderingObject)
    })

    result.removedItems.forEach(removed => {
      this.#renderer.removeItem(removed.item)
    })
  }

  end() {
    this.#isStart = false
    this.#lineItemGenerator.clear()
  }
}
