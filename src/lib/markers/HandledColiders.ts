import type { Raycaster } from '../Raycaster'
import type { ControlHandle, MouseControlHandles } from "../mouse/MouseControlHandles"

export class HandledColiders {
  #controlHandles: Array<ControlHandle> = []

  get handlers() {
    return this.#controlHandles.map(item => item.handled)
  }

  addHandler(handler: ControlHandle) {
    this.#controlHandles.push(handler)
  }

  attach(raycaster: Raycaster, mouseHandlers: MouseControlHandles) {
    this.detach(raycaster, mouseHandlers)

    if (this.#controlHandles.length === 0) {
      throw new Error('No handlers to attach')
    }

    this.#controlHandles.forEach(handle => {
      raycaster.addTarget(handle.colider)
      mouseHandlers.add(handle)
    })
  }

  detach(raycaster: Raycaster, mouseHandlers: MouseControlHandles) {
    this.#controlHandles.forEach(handle => {
      raycaster.removeTarget(handle.colider)
      mouseHandlers.remove(handle)
    })
  }
}
