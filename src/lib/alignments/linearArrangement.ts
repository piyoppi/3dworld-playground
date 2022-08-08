import { Line } from "../lines/line.js"
import { Alignment, Alignable } from "./alignment.js"

export class LinearAlignment implements Alignment {
  #line: Line
  #spacing: number

  constructor(line: Line) {
    this.#line = line
    this.#spacing = 0
  }

  align(items: Array<Alignable>, span: number) {
    const tSpan = (this.#spacing + span) / this.#line.length

    let t = 0
    items.forEach(item => {
      item.position = this.#line.getPosition(t)

      if (t + tSpan <= 1) {
        t += tSpan
      }
    })
  }
}
