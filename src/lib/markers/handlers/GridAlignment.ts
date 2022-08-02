import { VectorArray3 } from "../../Matrix.js"
import { AlignmentAdapter } from './AlignmentAdapter.js'

export class GridAlignment implements AlignmentAdapter {
  #currentPosition: VectorArray3
  #resolution: number
  #updated: boolean
  #alignedPosition: VectorArray3

  constructor() {
    this.#currentPosition = [0, 0, 0]
    this.#alignedPosition = [0, 0, 0]
    this.#resolution = 1
    this.#updated = false
  }

  get resolution(): number {
    return this.#resolution
  }

  set resolution(val: number) {
    this.#resolution = val
  }

  get alignedPosition(): VectorArray3 {
    if (!this.#updated) return this.#alignedPosition

      this.#alignedPosition = [
        Math.round(this.#currentPosition[0] / this.#resolution) * this.#resolution,
        Math.round(this.#currentPosition[1] / this.#resolution) * this.#resolution,
        Math.round(this.#currentPosition[2] / this.#resolution) * this.#resolution
      ]

    this.#updated = false

    return this.#alignedPosition
  }

  reset(position: VectorArray3) {
    this.#currentPosition = position
  }

  add(addingVector: VectorArray3) {
    this.#currentPosition[0] += addingVector[0]
    this.#currentPosition[1] += addingVector[1]
    this.#currentPosition[2] += addingVector[2]

    this.#updated = true
  }
}
