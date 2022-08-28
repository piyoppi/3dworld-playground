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

  attach(raycaster: Raycaster, interactionHandler: MouseHandlers) {
    this.detach(raycaster, interactionHandler)

    this.#controlHandles.forEach(handle => {
      raycaster.addTarget(handle.colider)
      interactionHandler.add(handle)
    })
  }

  detach(raycaster: Raycaster, interactionHandler: MouseHandlers) {
    this.#controlHandles.forEach(handle => {
      raycaster.removeTarget(handle.colider)
      interactionHandler.remove(handle)
    })
  }
}
