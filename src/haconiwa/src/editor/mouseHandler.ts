import { MouseControllable } from '../../../lib/mouse/MouseControllable.js'

type MouseDownCallbackFunction = (x: number, y: number, mouseButton: number) => void

export class HaconiwaMouseHandler {
  #mouseControlHandlers: Array<MouseControllable> = []
  #beforeMouseDownCallbacks: Array<MouseDownCallbackFunction> = []

  captureMouseEvent() {
    window.addEventListener('mousedown', e => this.mouseDown(e.screenX, e.screenY, e.button))
    window.addEventListener('mousemove', e => this.mouseMove(e.screenX, e.screenY))
    window.addEventListener('mouseup', _ => this.mouseUp())
    window.addEventListener('wheel', e => this.mouseWheel(e.deltaY))
  }

  add(handler: MouseControllable) {
    this.#mouseControlHandlers.push(handler)
  }

  addBeforeMouseDownCallback(callback: MouseDownCallbackFunction) {
    this.#beforeMouseDownCallbacks.push(callback)
  }

  mouseDown(x: number, y: number, mouseButton: number) {
    this.#beforeMouseDownCallbacks.forEach(func => func(x, y, mouseButton))
    this.#mouseControlHandlers.forEach(handler => handler.start(x, y))
  }

  mouseMove(x: number, y: number) {
    this.#mouseControlHandlers.forEach(handler => handler.move(x, y))
  }

  mouseUp() {
    this.#mouseControlHandlers.forEach(handler => handler.end())
  }

  mouseWheel(delta: number) {
    this.#mouseControlHandlers.forEach(handler => handler.wheel && handler.wheel(delta))
  }
}
