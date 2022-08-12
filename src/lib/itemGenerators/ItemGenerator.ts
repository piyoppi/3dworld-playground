import { Raycaster } from "../Raycaster.js"
import { Item } from "../Item.js"
import { Line } from "../lines/line.js"
import { LineSegment } from "../lines/lineSegment.js"
import { VectorArray3 } from "../Matrix.js"
import { MouseControllable } from "../mouse/MouseDragHandler"
import { Renderer } from "../Renderer.js"
import { LinearAlignment } from "../alignments/linearArrangement.js"
import { Coordinate } from "../Coordinate.js"
import { Mat4 } from "../Matrix.js"

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

export class LineItemGeneratorAdapter<T> implements MouseControllable {
  #raycaster: Raycaster
  #lineItemGenerator: LineItemGenerator<T>
  #renderer: Renderer<T>

  constructor(lineGenerator: LineGenerator, generator: GenerateItemFactory<T>, renderer: Renderer<T>, span: number, raycaster: Raycaster) {
    this.#raycaster = raycaster
    this.#renderer = renderer
    this.#lineItemGenerator = new LineItemGenerator<T>(lineGenerator, generator, span)
  }

  get isStart() {
    return this.#lineItemGenerator.isStart
  }

  start(cursorX: number, cursorY: number) {
    if (!this.#raycaster.hasColided) return

    const position = this.#raycaster.colidedDetails[0].position
    this.#lineItemGenerator.start(position)
  }

  move(cursorX: number, cursorY: number) {
    if (!this.#lineItemGenerator.isStart || !this.#raycaster.hasColided) return

    const position = this.#raycaster.colidedDetails[0].position
    const result = this.#lineItemGenerator.move(position)

    result.generatedItems.forEach(generated => {
      this.#renderer.addItem(generated.item, generated.renderingObject)
    })

    result.removedItems.forEach(removed => {
      this.#renderer.removeItem(removed.item)
    })
  }

  end() {
    this.#lineItemGenerator.end()
  }
}

export class LineItemGenerator<T> {
  #lineGenerator: LineGenerator
  #generator: GenerateItemFactory<T>
  #startPosition: VectorArray3 = [0, 0, 0]
  #isStart: boolean = false
  #itemSpan: number
  #generated: Array<GeneratedItem<T>> = []
  #generatedItemsCoordinate: Array<Coordinate> = []

  constructor(lineGenerator: LineGenerator, generator: GenerateItemFactory<T>, span: number) {
    this.#lineGenerator = lineGenerator
    this.#generator = generator
    this.#itemSpan = span
  }

  get isStart() {
    return this.#isStart
  }

  get generated() {
    return this.#generated
  }

  start(position: VectorArray3) {
    this.#generated = []
    this.#generatedItemsCoordinate = []

    this.#startPosition = position

    this.#lineGenerator.setStartPosition(this.#startPosition)

    this.#isStart = true
  }

  move(currentPosition: VectorArray3) {
    if (!this.#isStart) return {generatedItems: [], removedItems: []}

    this.#lineGenerator.setPosition(currentPosition)

    const line = this.#lineGenerator.getLine()
    const itemCount = Math.floor(line.length / this.#itemSpan)
    const shortage = itemCount - this.#generated.length

    const generatedItems = []
    const removedItems = []

    for (let i = 0; i < shortage; i++) {
      const generated = this.#generator()
      this.#generated.push(generated)
      this.#generatedItemsCoordinate.push(generated.item.parentCoordinate)
      generatedItems.push(generated)
    }

    if (shortage < 0) {
      for (let i = -shortage; i >= 0; i--) {
        const removed = this.#generated.splice(i, 1)
        this.#generatedItemsCoordinate.splice(i, 1)

        removedItems.push(removed[0])
      }
    }

    const alignment = new LinearAlignment(line)
    alignment.align(this.#generatedItemsCoordinate.length, this.#itemSpan).forEach((aligned, index) => {
      const coordinate = this.#generatedItemsCoordinate[index]
      coordinate.matrix = Mat4.transformZAxis(aligned.direction, aligned.position)
    })

    return {
      generatedItems,
      removedItems
    }
  }

  end() {
    if (!this.#isStart) return
    this.#isStart = false
  }
}
