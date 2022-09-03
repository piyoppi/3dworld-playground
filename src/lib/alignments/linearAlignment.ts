import { Line } from "../lines/line.js"
import { Alignment, Aligned } from "./alignment.js"

export class LinearAlignment implements Alignment {
  #line: Line
  #spacing: number

  constructor(line: Line) {
    this.#line = line
    this.#spacing = 0
  }

  align(itemCount: number, span: number): Array<Aligned> {
    const tSpan = (this.#spacing + span) / this.#line.length

    let t = 0
    let aligned: Array<Aligned> = []
    for(let i = 0; i < itemCount; i++) {
      aligned.push({
        position: this.#line.getPosition(t),
        direction: this.#line.getDirection(t)
      })

      if (t + tSpan <= 1) {
        t += tSpan
      }
    }

    return aligned
  }
}
