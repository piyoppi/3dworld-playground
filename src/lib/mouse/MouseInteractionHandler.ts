import { Colider } from "../Colider"
import { MouseControllable } from "./MouseControllable.js"
import { Raycaster } from "../Raycaster"

export type ControlHandle = {
  colider: Colider,
  handled: MouseControllable
}

export class MouseHandlers implements MouseControllable {
  #raycasters: Array<Raycaster>
  #handleItems: Array<ControlHandle>
  #handlingItems: Array<ControlHandle>
  #isStart: boolean = false

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

  get isStart() {
    return this.#isStart
  }

  start(screenX: number, screenY: number) {
    this.colidedHandleItems()
      .forEach(handledItem => {
        if (!handledItem.handled.isStart) {
          handledItem.handled.start(screenX, screenY)
          this.#handlingItems.push(handledItem)
        }
      })
  }

  move(screenX: number, screenY: number) {
    this.#handlingItems.forEach(handledItem => handledItem.handled.move(screenX, screenY))
  }

  end() {
    this.#handlingItems.forEach(handledItem => handledItem.handled.end())
      
    this.#handlingItems.length = 0
  }

  capture() {
    window.addEventListener('mousedown', e => this.start(e.screenX, e.screenY))
    window.addEventListener('mousemove', e => this.move(e.screenX, e.screenY))
    window.addEventListener('mouseup', _ => this.end())
  }

  private colidedHandleItems() {
    const colided = this.#raycasters.map(raycaster => raycaster.colidedColiders).flat()
    return this.#handleItems.filter(handledItem => colided.includes(handledItem.colider))
  }
}
