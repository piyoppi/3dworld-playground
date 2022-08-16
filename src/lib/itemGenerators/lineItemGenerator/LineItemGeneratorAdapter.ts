import type { Raycaster } from "../../Raycaster"
import type { MouseControllable } from "../../mouse/MouseControllable"
import type { Renderer } from "../../Renderer"
import { LineItemGenerator } from "./LineItemGenerator.js"
import type { LineGenerator } from "./lineGenerator/LineGenerator"
import type { Item } from "../../Item"
import type { GenerateItemFactory } from "../ItemGenerator"
import type { Coordinate } from "../../Coordinate"

export class LineRenderingItemGenerator<T> implements MouseControllable {
  #raycaster: Raycaster
  #lineItemGenerator: LineItemGenerator<Coordinate, T>
  #renderer: Renderer<T>
  #isStart: boolean = false

  constructor(lineGenerator: LineGenerator, generator: GenerateItemFactory<Coordinate, T>, renderer: Renderer<T>, span: number, raycaster: Raycaster) {
    this.#raycaster = raycaster
    this.#renderer = renderer
    this.#lineItemGenerator = new LineItemGenerator<Coordinate, T>(lineGenerator, generator, span)
  }

  get isStart() {
    return this.#isStart
  }

  get generated() {
    return this.#lineItemGenerator.generated
  }

  start(cursorX: number, cursorY: number) {
    if (!this.#raycaster.hasColided) return

    this.#lineItemGenerator.setStartPosition(this.#raycaster.colidedDetails[0].position)

    this.#isStart = true
  }

  move(cursorX: number, cursorY: number) {
    if (!this.#isStart || !this.#raycaster.hasColided) return

    const result = this.#lineItemGenerator.setEndPosition(this.#raycaster.colidedDetails[0].position)

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
  }
}
