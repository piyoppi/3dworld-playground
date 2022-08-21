import type { MatrixArray4, VectorArray3 } from "../../Matrix"
import { LinearAlignment } from "../../alignments/linearArrangement.js"
import { Mat4 } from "../../Matrix.js"
import type { LineGenerator } from "./lineGenerator/LineGenerator"
import type { GeneratedItem, GenerateItemFactory, ItemGenerator } from "../ItemGenerator"
import { Line } from "../../lines/line.js"

export class LineItemGenerator<T, U> implements ItemGenerator<T, U> {
  #lineGenerator: LineGenerator
  #generator: GenerateItemFactory<T, U>
  #startPosition: VectorArray3 = [0, 0, 0]
  #itemSpan: number
  #generated: Array<GeneratedItem<T, U>> = []
  #line: Line | null = null

  constructor(lineGenerator: LineGenerator, generator: GenerateItemFactory<T, U>, span: number) {
    this.#lineGenerator = lineGenerator
    this.#generator = generator
    this.#itemSpan = span
  }

  get generated() {
    return this.#generated
  }

  get line() {
    return this.#line
  }

  setGeneratedItems(items: Array<GeneratedItem<T, U>>) {
    this.#generated = items
  }

  setStartPosition(position: VectorArray3) {
    this.#generated = []

    this.#startPosition = position

    this.#lineGenerator.setStartPosition(this.#startPosition)
  }

  setEndPosition(currentPosition: VectorArray3) {
    this.#lineGenerator.setPosition(currentPosition)

    const line = this.#lineGenerator.getLine()
    this.#line = line

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
}
