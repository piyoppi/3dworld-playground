import { Colider } from "../Colider"
import { MouseControllable } from "./MouseDragHandler"
import { Raycaster } from "../Raycaster"

export type ControlHandle = {
  colider: Colider,
  handled: MouseControllable
}

export class MouseInteractionHandler {
  #raycasters: Array<Raycaster>
  #handleItems: Array<ControlHandle>
  #handlingItems: Array<ControlHandle>

  constructor() {
    this.#raycasters = []
    this.#handleItems = []
    this.#handlingItems = []
  }

  get handling() {
    return this.#handlingItems.length > 0
  }

  addRaycaster(raycaster: Raycaster) {
    this.#raycasters.push(raycaster)
  }
 
  add(handled: ControlHandle | Array<ControlHandle>) {
    if (!Array.isArray(handled)) handled = [handled]

    handled.forEach(item => this.#handleItems.push(item))
  }

  remove(handled: ControlHandle) {
    this.#handleItems.map((handler, index) => handler === handled ? index : -1)
      .filter(index => index >= 0)
      .sort((a, b) => b - a)
      .forEach(index => {
        this.#handleItems.splice(index, 1)
      })
  }

  mousedown(screenX: number, screenY: number) {
    this.colidedHandleItems()
      .forEach(handledItem => {
        if (!handledItem.handled.isStart) {
          handledItem.handled.start(screenX, screenY)
          this.#handlingItems.push(handledItem)
        }
      })
  }

  mousemove(screenX: number, screenY: number) {
    this.#handlingItems.forEach(handledItem => handledItem.handled.move(screenX, screenY))
  }

  mouseup(screenX: number, screenY: number) {
    this.#handlingItems.forEach(handledItem => handledItem.handled.end())
      
    this.#handlingItems.length = 0
  }

  capture() {
    window.addEventListener('mousedown', e => this.mousedown(e.screenX, e.screenY))
    window.addEventListener('mousemove', e => this.mousemove(e.screenX, e.screenY))
    window.addEventListener('mouseup', e => this.mouseup(e.screenX, e.screenY))
  }

  private colidedHandleItems() {
    const colided = this.#raycasters.map(raycaster => raycaster.colidedColiders).flat()
    return this.#handleItems.filter(handledItem => colided.includes(handledItem.colider))
  }
}