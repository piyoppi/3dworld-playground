import type { MatrixArray4, VectorArray3 } from "../../Matrix"
import { LinearAlignment } from "../../alignments/linearAlignment.js"
import { Mat4 } from "../../Matrix.js"
import type { LineGenerator } from "./lineGenerator/LineGenerator"
import type { GeneratedItem, GenerateItemFactory, ItemGenerator } from "../ItemGenerator"
import { Line } from "../../lines/line.js"

export type LineItemGenerated<T, U> = {
   generatedItems: Array<GeneratedItem<T, U>>,
   removedItems: Array<GeneratedItem<T, U>>,
   transformMatrixes: Array<MatrixArray4>,
   items: Array<GeneratedItem<T, U>>
}

export class LineItemGenerator<T, U> implements ItemGenerator<T, U> {
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
      for (let i = -shortage; i >= 0; i--) {
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
    console.log(cloned.#generated);

    return cloned
  }
}
