import { Raycaster } from '../Raycaster.js'
import { Colider } from '../Colider.js'
import { ControlHandle, MouseHandlers } from "../mouse/MouseHandlers.js"

export class HandledColiders {
  #coliders: Array<Colider>
  #handles: Array<ControlHandle>

  constructor() {
    this.#coliders = []
    this.#handles = []
  }

  setHandles(raycaster: Raycaster, interactionHandler: MouseHandlers, handles: Array<ControlHandle>) {
    this.removeHandles(raycaster, interactionHandler)

    this.#coliders = handles.map(handle => handle.colider)
    this.#handles = handles

    this.#coliders.forEach(colider => raycaster.addTarget(colider))
    this.#handles.forEach(handle => interactionHandler.add(handle))
  }

  removeHandles(raycaster: Raycaster, interactionHandler: MouseHandlers) {
    this.#coliders.forEach(colider => raycaster.removeTarget(colider))
    this.#handles.forEach(controlHandle => interactionHandler.remove(controlHandle))

    this.#coliders = []
    this.#handles = []
  }
}
