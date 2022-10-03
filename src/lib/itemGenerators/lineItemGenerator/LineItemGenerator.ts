import type { MatrixArray4 } from "../../Matrix"
import type { GeneratedItem, GenerateItemFactory, ItemGenerator } from "../ItemGenerator"
import type { Line } from "../../lines/line"
import { LinearAlignment } from "../../alignments/linearAlignment.js"
import { Mat4 } from "../../Matrix.js"
import { RenderingObject } from "../../RenderingObject"

export type LineItemGenerated<T, U extends RenderingObject<U>> = {
   generatedItems: Array<GeneratedItem<T, U>>,
   removedItems: Array<GeneratedItem<T, U>>,
   transformMatrixes: Array<MatrixArray4>,
   items: Array<GeneratedItem<T, U>>
}

export class LineItemGenerator<T, U extends RenderingObject<U>> implements ItemGenerator<T, U> {
  #generator: GenerateItemFactory<T, U>
  #itemSpan: number
  #generated: Array<GeneratedItem<T, U>> = []

  constructor(generator: GenerateItemFactory<T, U>, span: number) {
    this.#generator = generator
    this.#itemSpan = span
  }

  get generated() {
    return this.#generated
  }

  setGeneratedItems(items: Array<GeneratedItem<T, U>>) {
    this.#generated = items
  }

  update(line: Line): LineItemGenerated<T, U> {
    const itemCount = Math.floor(line.length / this.#itemSpan)
    const shortage = itemCount - this.#generated.length

    const generatedItems: Array<GeneratedItem<T, U>> = []
    const removedItems: Array<GeneratedItem<T, U>> = []

    for (let i = 0; i < shortage; i++) {
      const generated = this.#generator()
      this.#generated.push(generated)
      generatedItems.push(generated)
    }

    if (shortage < 0) {
      for (let i = -shortage - 1; i >= 0; i--) {
        const removed = this.#generated.splice(i, 1)

        removedItems.push(removed[0])
      }
    }

    const alignment = new LinearAlignment(line)
    const transformMatrixes: Array<MatrixArray4> = alignment.align(this.#generated.length, this.#itemSpan).map(aligned => Mat4.transformZAxis(aligned.direction, aligned.position))

    return {
      generatedItems,
      removedItems,
      transformMatrixes,
      items: this.#generated
    }
  }

  clear() {
    this.#generated.length = 0
  }

  clone() {
    const cloned = new LineItemGenerator(this.#generator, this.#itemSpan)
    cloned.#generated = this.#generated

    return cloned
  }
}
