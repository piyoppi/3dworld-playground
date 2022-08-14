import { MouseControllable } from '../../../lib/mouse/MouseControllable.js'

type MouseDownCallbackFunction = (x: number, y: number, mouseButton: number) => void
type MouseMoveCallbackFunction = (x: number, y: number) => void

export class HaconiwaMouseHandler {
  #mouseControlHandlers: Array<MouseControllable> = []
  #beforeMouseDownCallbacks: Array<MouseDownCallbackFunction> = []
  #beforeMouseMoveCallbacks: Array<MouseMoveCallbackFunction> = []

  captureMouseEvent() {
    window.addEventListener('mousedown', e => this.mouseDown(e.screenX, e.screenY, e.button))
    window.addEventListener('mousemove', e => this.mouseMove(e.screenX, e.screenY))
    window.addEventListener('mouseup', _ => this.mouseUp())
    window.addEventListener('wheel', e => this.mouseWheel(e.deltaY))
  }

  add(handler: MouseControllable) {
    this.#mouseControlHandlers.push(handler)
  }

  remove(handler: MouseControllable) {
    const index = this.#mouseControlHandlers.findIndex(item => item === handler)

    if (index < 0) return

    this.#mouseControlHandlers.splice(index, 1)
  }

  addBeforeMouseDownCallback(callback: MouseDownCallbackFunction) {
    this.#beforeMouseDownCallbacks.push(callback)
  }

  addBeforeMouseMoveCallback(callback: MouseMoveCallbackFunction) {
    this.#beforeMouseMoveCallbacks.push(callback)
  }

  mouseDown(x: number, y: number, mouseButton: number) {
    this.#beforeMouseDownCallbacks.forEach(func => func(x, y, mouseButton))
    this.#mouseControlHandlers.forEach(handler => handler.start(x, y))
  }

  mouseMove(x: number, y: number) {
    this.#beforeMouseMoveCallbacks.forEach(func => func(x, y))
    this.#mouseControlHandlers.forEach(handler => handler.move(x, y))
  }

  mouseUp() {
    this.#mouseControlHandlers.forEach(handler => handler.end())
  }

  mouseWheel(delta: number) {
    this.#mouseControlHandlers.forEach(handler => handler.wheel && handler.wheel(delta))
  }
}
