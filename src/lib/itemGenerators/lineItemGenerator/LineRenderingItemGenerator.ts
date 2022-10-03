import type { Renderer } from "../../Renderer"
import type { Coordinate } from "../../Coordinate"
import type { LineItemGenerated } from "./LineItemGenerator"
import { RenderingObject } from "../../RenderingObject"

export class LineRenderingItemGenerator<T extends RenderingObject<T>> {
  #renderer: Renderer<T>

  constructor(renderer: Renderer<T>) {
    this.#renderer = renderer
  }

  get renderer() {
    return this.#renderer
  }

  update(lineItemGenerated: LineItemGenerated<Coordinate, T>, parentCoordinate: Coordinate) {
    lineItemGenerated.transformMatrixes.forEach((matrix, index) => {
      lineItemGenerated.items[index].item.setMatrix(matrix)
    })

    lineItemGenerated.generatedItems.forEach(generated => {
      this.#renderer.addItem(generated.item, generated.renderingObject)
      parentCoordinate.addChild(generated.item)
    })

    lineItemGenerated.removedItems.forEach(removed => {
      this.#renderer.removeItem(removed.item)
      parentCoordinate.removeChild(removed.item)
    })
  }
}
