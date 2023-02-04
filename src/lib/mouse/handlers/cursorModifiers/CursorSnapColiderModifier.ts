import { Colider, CoordinatedColider } from "../../../Colider"
import { VectorArray3 } from "../../../Matrix"
import { Raycaster } from "../../../Raycaster"
import type { CursorModifier } from './CursorModifier'

export class CursorSnapColiderModifier implements CursorModifier {
  #currentPosition: VectorArray3
  #raycaster: Raycaster<CoordinatedColider>
  #ignoredColiders: Array<CoordinatedColider>

  constructor(raycaster: Raycaster<CoordinatedColider>, ignoredColiders: Array<CoordinatedColider>) {
    this.#currentPosition = [0, 0, 0]
    this.#raycaster = raycaster
    this.#ignoredColiders = ignoredColiders
  }

  get alignedPosition(): VectorArray3 {
    if (!this.#raycaster.hasColided) {
      return this.#currentPosition
    }

    const colidedDetail = this.#raycaster.colidedDetails.find(colidedDetail => this.#ignoredColiders.every(ignoredColider => ignoredColider !== colidedDetail.colider))

    if (!colidedDetail) {
      return this.#currentPosition
    }

    return colidedDetail.colider.parentCoordinate.position
  }

  add(addingVector: VectorArray3) {
    this.#currentPosition[0] += addingVector[0]
    this.#currentPosition[1] += addingVector[1]
    this.#currentPosition[2] += addingVector[2]
  }

  reset(position: VectorArray3) {
    this.#currentPosition = position
  }

  setPosition(vec: VectorArray3) {
    this.#currentPosition = vec
  }
}
