import type { Colider } from "../Colider"
import type { MouseControllable, MouseButton, MouseControllableCallbackFunction } from "./MouseControllable"
import type { Raycaster } from "../Raycaster"
import type { Camera } from "../Camera"
import { convertButtonNumberToMouseButtonsType } from "./ConvertMouseButtonIdToMouseButtonType.js"

export type ControlHandle = {
  colider: Colider,
  handled: MouseControllable
}

type MouseDownCallbackFunction = (x: number, y: number, mouseButton: MouseButton) => void
type MouseMoveCallbackFunction = (x: number, y: number, mouseButton: MouseButton) => void

export class MouseHandlers {
  #raycasters: Array<Raycaster>
  #handleItems: Array<{controlHandle: ControlHandle, startedCallback: MouseControllableCallbackFunction}>
  #handlingItems: Array<{controlHandle: ControlHandle, startedCallback: MouseControllableCallbackFunction}>
  #isStart: boolean = false
  #camera: Camera
  #beforeMouseDownCallbacks: Array<MouseDownCallbackFunction> = []
  #beforeMouseMoveCallbacks: Array<MouseMoveCallbackFunction> = []

  constructor(camera: Camera) {
    this.#raycasters = []
    this.#handleItems = []
    this.#handlingItems = []
    this.#camera = camera
  }

  get handling() {
    return this.#handlingItems.length > 0
  }

  addBeforeMouseDownCallback(callback: MouseDownCallbackFunction) {
    this.#beforeMouseDownCallbacks.push(callback)
  }

  addBeforeMouseMoveCallback(callback: MouseMoveCallbackFunction) {
    this.#beforeMouseMoveCallbacks.push(callback)
  }

  addRaycaster(raycaster: Raycaster) {
    this.#raycasters.push(raycaster)
  }
 
  add(handled: ControlHandle | Array<ControlHandle>) {
    if (!Array.isArray(handled)) handled = [handled]

    handled.forEach(controlHandle => {
      const startedCallback = () => {
        this.#handlingItems.push({controlHandle, startedCallback})
      }
      controlHandle.handled.setStartedCallback(startedCallback)
      this.#handleItems.push({controlHandle, startedCallback})
    })
  }

  remove(handled: ControlHandle) {
    this.#handleItems.map((handler, index) => handler.controlHandle === handled ? index : -1)
      .filter(index => index >= 0)
      .sort((a, b) => b - a)
      .forEach(index => {
        this.#handleItems.splice(index, 1)
      })
  }

  get isStart() {
    return this.#isStart
  }

  start(screenX: number, screenY: number, button: number) {
    const mouseButton = convertButtonNumberToMouseButtonsType(button)

    this.#beforeMouseDownCallbacks.forEach(func => func(screenX, screenY, mouseButton))

    this.colidedHandleItems()
      .forEach(handledItem => {
        if (!handledItem.controlHandle.handled.isStart) {
          handledItem.controlHandle.handled.start(screenX, screenY, mouseButton, this.#camera.coordinate)
        }
      })
  }

  move(screenX: number, screenY: number, button: number) {
    const mouseButton = convertButtonNumberToMouseButtonsType(button)

    this.#beforeMouseMoveCallbacks.forEach(func => func(screenX, screenY, mouseButton))

    this.#handlingItems.forEach(handledItem => handledItem.controlHandle.handled.move(screenX, screenY, mouseButton, this.#camera.coordinate))
  }

  end() {
    this.#handlingItems.forEach(handledItem => {
      handledItem.controlHandle.handled.end()
    })
      
    this.#handlingItems.length = 0
  }

  mouseWheel(delta: number) {
    this.#handleItems.forEach(item => item.controlHandle.handled.wheel && item.controlHandle.handled.wheel(delta))
  }

  captureMouseEvent() {
    window.addEventListener('mousedown', e => this.start(e.screenX, e.screenY, e.button))
    window.addEventListener('mousemove', e => this.move(e.screenX, e.screenY, e.button))
    window.addEventListener('mouseup', _ => this.end())
    window.addEventListener('wheel', e => this.mouseWheel(e.deltaY))
  }

  private colidedHandleItems() {
    const colided = this.#raycasters.map(raycaster => raycaster.colidedColiders).flat()
    return this.#handleItems.filter(handledItem => colided.includes(handledItem.controlHandle.colider))
  }
}