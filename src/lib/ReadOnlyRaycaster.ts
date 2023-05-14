import type { Colider } from "./Colider"
import type { Raycaster } from "./Raycaster"

export class ReadOnlyRaycaster<T extends Colider = Colider> {
  constructor(
    public readonly raycaster: Raycaster<T>
  ) {
  }

  get colidedColiders() {
    return this.raycaster.colidedColiders
  }

  get colidedDetails() {
    return this.raycaster.colidedDetails
  }

  get colided() {
    return this.raycaster.colided
  }

  check(normalizedX: number, normalizedY: number) {
    return this.raycaster.check(normalizedX, normalizedY)
  }
}
