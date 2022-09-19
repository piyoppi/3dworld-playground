import type { Raycaster } from '../Raycaster'
import type { ControlHandle, MouseControlHandles } from "../mouse/MouseControlHandles"

export class HandledColiders {
  #controlHandles: Array<ControlHandle> = []

  get handlers() {
    return this.#controlHandles.map(item => item.handled)
  }

  setHandles(handles: Array<ControlHandle>) {
    this.#controlHandles = handles
  }

  attach(raycaster: Raycaster, mouseHandlers: MouseControlHandles) {
    this.detach(raycaster, mouseHandlers)

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
