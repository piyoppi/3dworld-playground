import { Raycaster } from '../Raycaster.js'
import { Colider } from '../Colider.js'
import { MouseControllable } from '../mouse/MouseControllable.js'
import { ControlHandle, MouseInteractionHandler } from "../mouse/MouseInteractionHandler.js"

export class HandledColiders {
  #coliders: Array<Colider>
  #handles: Array<ControlHandle>

  constructor() {
    this.#coliders = []
    this.#handles = []
  }

  setColider(raycaster: Raycaster, interactionHandler: MouseInteractionHandler, coliders: Array<Colider>, handles: Array<ControlHandle>) {
    this.#coliders.forEach(colider => raycaster.removeTarget(colider))
    this.#handles.forEach(controlHandle => interactionHandler.remove(controlHandle))

    this.#coliders = coliders
    this.#handles = handles

    this.#coliders.forEach(colider => raycaster.addTarget(colider))
    this.#handles.forEach(handle => interactionHandler.add(handle))
  }
}
