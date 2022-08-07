import { Raycaster } from "../Raycaster.js"
import { Item } from "../Item.js"
import { Line } from "../lines/line.js"
import { LineSegment } from "../lines/lineSegment.js"
import { VectorArray3 } from "../Matrix.js"
import { MouseControllable } from "../mouse/MouseDragHandler"
import { Renderer } from "../Renderer.js"
import { LinearAlignment } from "../alignments/linearArrangement.js"
import { Alignable } from "../alignments/alignment.js"

export type GeneratedItem<T> = {item: Item, renderingObject: T}
export type GenerateItemFactory<T> = () => GeneratedItem<T>

export interface LineGenerator {
  setStartPosition: (pos: VectorArray3) => void
  setPosition: (pos: VectorArray3) => void
  getLine: () => Line
}

export class LineSegmentGenerator implements LineGenerator {
  #start: VectorArray3 = [0, 0, 0]
  #end: VectorArray3 = [0, 0, 0]

  setStartPosition(position: VectorArray3) {
    this.#start = position
  }

  setPosition(position: VectorArray3) {
    this.#end = position
  }

  getLine() {
    return new LineSegment(this.#start, this.#end)
  }
}

export class LineItemGenerator<T> implements MouseControllable {
  #lineGenerator: LineGenerator
  #generator: GenerateItemFactory<T>
  #raycaster: Raycaster
  #startPosition: VectorArray3 = [0, 0, 0]
  #currentPosition: VectorArray3 = [0, 0, 0]
  #isStart: boolean = false
  #itemSpan: number
  #generated: Array<GeneratedItem<T>> = []
  #generatedItemsCoordinate: Array<Alignable> = []
  #renderer: Renderer<T>

  constructor(lineGenerator: LineGenerator, generator: GenerateItemFactory<T>, renderer: Renderer<T>, span: number, raycaster: Raycaster) {
    this.#lineGenerator = lineGenerator
    this.#generator = generator
    this.#raycaster = raycaster
    this.#itemSpan = span
    this.#renderer = renderer
  }

  get isStart() {
    return this.#isStart
  }

  get generated() {
    return this.#generated
  }

  start(cursorX: number, cursorY: number) {
    if (!this.#raycaster.hasColided) return 

    this.#startPosition = this.#raycaster.colidedDetails[0].position
    this.#currentPosition = this.#raycaster.colidedDetails[0].position

    this.#lineGenerator.setStartPosition(this.#startPosition)

    this.#isStart = true
  }

  move(cursorX: number, cursorY: number) {
    if (!this.#isStart) return

    this.#currentPosition = this.#raycaster.colidedDetails[0].position
    this.#lineGenerator.setPosition(this.#currentPosition)

    const line = this.#lineGenerator.getLine()
    const itemCount = Math.floor(line.length / this.#itemSpan)
    const shortage = itemCount - this.#generated.length

    for (let i = 0; i < shortage; i++) {
      const generated = this.#generator()
      this.#renderer.addItem(generated.item, generated.renderingObject)
      this.#generated.push(generated)
      this.#generatedItemsCoordinate.push(generated.item.parentCoordinate)
    }

    for (let i = -shortage; i >= 0; i--) {
      const removed = this.#generated.splice(i, 1)
      this.#generatedItemsCoordinate.splice(i, 1)

      this.#renderer.removeItem(removed[0].item)
    }

    const alignment = new LinearAlignment(line)
    alignment.align(this.#generatedItemsCoordinate, this.#itemSpan)
  }

  end() {
    this.#isStart = false
  }
}
