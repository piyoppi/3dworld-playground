import type { VectorArray2 } from "./Matrix"
import type { Raycaster } from "./Raycaster"

export type RaycasterItemOptions = {
  transparency: boolean
}

type RaycasterItem = {
  raycaster: Raycaster,
  enabled: boolean
  options: RaycasterItemOptions
}

export class Raycasters {
  #raycasters: Array<RaycasterItem> = []

  get colidedColiders() {
    return this.#raycasters.map(item => item.raycaster.colidedColiders).flat()
  }

  forEach(callback: (raycaster: Raycaster) => void) {
    this.#raycasters.forEach(item => callback(item.raycaster))
  }

  add(raycaster: Raycaster, options: RaycasterItemOptions = {transparency: true}) {
    this.#raycasters.push({raycaster, enabled: true, options})
  }

  remove(raycaster: Raycaster) {
    const index = this.#raycasters.findIndex(item => item.raycaster === raycaster)
    
    if (index < 0) throw new Error('The raycaster is not found.')

    this.#raycasters.splice(index, 1)
  }

  disable(raycaster: Raycaster) {
    const target = this.#raycasters.find(item => item.raycaster === raycaster)

    if (!target) throw new Error('The raycaster is not found.')

    target.enabled = false
  }

  enable(raycaster: Raycaster) {
    const target = this.#raycasters.find(item => item.raycaster === raycaster)

    if (!target) throw new Error('The raycaster is not found.')

    target.enabled = true
  }

  check(pos: VectorArray2) {
    let skip = false

    return this.#raycasters.map(item => {
      if (skip || !item.enabled) {
        item.raycaster.clear()
        return []
      }

      const coliders = item.raycaster.check(pos[0], pos[1])

      if (!skip && !item.options.transparency && coliders.length > 0) {
        skip = true
      }

      return coliders
    })
  }

  clear() {
    this.#raycasters.forEach(item => item.raycaster.clear())
  }
}
