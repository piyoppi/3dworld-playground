import type { Colider } from "../Colider"
import type { MouseControllable, MouseButton, MouseControllableCallbackFunction } from "./MouseControllable"
import type { Camera } from "../Camera"
import { convertButtonNumberToMouseButtonsType } from "./ConvertMouseButtonIdToMouseButtonType.js"
import { Raycasters } from "../Raycasters.js"
import { getNormalizedScreenPosition } from "./NormalizedScreenPosition.js"
import { VectorArray2 } from "../Matrix"

export type ControlHandle = {
  colider: Colider,
  handled: MouseControllable
}

type MouseDownCallbackFunction = (x: number, y: number, mouseButton: MouseButton) => void
type MouseMoveCallbackFunction = (x: number, y: number, mouseButton: MouseButton) => void

type HandleItem = {
  controlHandle: ControlHandle,
  startedCallback: MouseControllableCallbackFunction
}

export class MouseControlHandles {
  #raycasters: Raycasters
  #handleItems: Array<HandleItem>
  #handlingItems: Array<HandleItem>
  #isStart: boolean = false
  #camera: Camera
  #beforeMouseDownCallbacks: Array<MouseDownCallbackFunction> = []
  #beforeMouseMoveCallbacks: Array<MouseMoveCallbackFunction> = []
  #enabled = true
  #windowSize: VectorArray2

  constructor(camera: Camera, raycasters: Raycasters, windowWidth: number, windowHeight: number) {
    this.#raycasters = raycasters
    this.#handleItems = []
    this.#handlingItems = []
    this.#camera = camera
    this.#windowSize = [windowWidth, windowHeight]
  }

  get handling() {
    return this.#handlingItems.length > 0
  }

  get enabled() {
    return this.#enabled
  }

  set enabled(value: boolean) {
    this.#enabled = value
  }

  addBeforeMouseDownCallback(callback: MouseDownCallbackFunction) {
    this.#beforeMouseDownCallbacks.push(callback)
  }

  addBeforeMouseMoveCallback(callback: MouseMoveCallbackFunction) {
    this.#beforeMouseMoveCallbacks.push(callback)
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
    if (!this.#enabled) return

    const mouseButton = convertButtonNumberToMouseButtonsType(button)
    const normalized = getNormalizedScreenPosition([screenX, screenY], this.#windowSize)
    const normalizedX = normalized[0]
    const normalizedY = normalized[1]

    this.#beforeMouseDownCallbacks.forEach(func => func(screenX, screenY, mouseButton))

    const colidedHandleItems = this.colidedHandleItems()

    for (const handledItem of colidedHandleItems) {
      if (!handledItem.controlHandle.handled.isStart) {
        const skip = handledItem.controlHandle.handled.start({screenX, screenY, normalizedX, normalizedY}, mouseButton, this.#camera.coordinate)

        if (skip) break
      }
    }
  }

  move(screenX: number, screenY: number, button: number) {
    const mouseButton = convertButtonNumberToMouseButtonsType(button)
    const normalized = getNormalizedScreenPosition([screenX, screenY], this.#windowSize)
    const normalizedX = normalized[0]
    const normalizedY = normalized[1]

    this.#beforeMouseMoveCallbacks.forEach(func => func(screenX, screenY, mouseButton))

    this.#handlingItems.forEach(handledItem => handledItem.controlHandle.handled.move({screenX, screenY, normalizedX, normalizedY}, mouseButton, this.#camera.coordinate))
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
    return this.#raycasters.colidedColiders
      .map(colidedColider => this.#handleItems.filter(handleItem => handleItem.controlHandle.colider === colidedColider))
      .flat()
      .filter((item): item is HandleItem => !!item)
  }
}
