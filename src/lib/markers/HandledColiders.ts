import { Raycaster } from '../Raycaster.js'
import { Colider } from '../Colider.js'
import { ControlHandle, MouseHandlers } from "../mouse/MouseHandlers.js"

export class HandledColiders {
  #controlHandles: Array<ControlHandle> = []

  get handlers() {
    return this.#controlHandles
  }

  setHandles(handles: Array<ControlHandle>) {
    this.#controlHandles = handles
  }

  attach(raycaster: Raycaster, mouseHandlers: MouseHandlers) {
    this.detach(raycaster, mouseHandlers)

    this.#controlHandles.forEach(handle => {
      raycaster.addTarget(handle.colider)
      mouseHandlers.add(handle)
    })
  }

  detach(raycaster: Raycaster, mouseHandlers: MouseHandlers) {
    this.#controlHandles.forEach(handle => {
      raycaster.removeTarget(handle.colider)
      mouseHandlers.remove(handle)
    })
  }
}
