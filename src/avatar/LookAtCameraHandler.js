import { Mat4 } from './Matrix.js'

export class LookAtCameraHandler {
  #initialMousePosition
  #isStart
  #distance
  #rotation
  #target
  #changed

  constructor() {
    this.#initialMousePosition = [0, 0]
    this.#isStart = false
    this.#distance = 1
    this.#rotation = [0, 0]
    this.#target = [0, 0, 0]
    this.#changed = false
  }

  get distance() {
    return this.#distance
  }

  set distance(value) {
    this.#distance = value
  }

  get changed() {
    return this.#changed
  }

  setTarget(x, y, z) {
    this.#target[0] = x
    this.#target[1] = y
    this.#target[2] = z

    this.#changed = true
  }

  getCameraPosition() {
    return [
      this.#target[0] + this.#distance * Math.cos(this.#rotation[0]) * Math.cos(this.#rotation[1]),
      this.#target[1] + this.#distance * Math.sin(this.#rotation[0]),
      this.#target[2] + this.#distance * Math.cos(this.#rotation[0]) * Math.sin(this.#rotation[1]),
    ]
  }

  getLookAtMatrix() {
    this.#changed = false
    return Mat4.lookAt(this.#target, this.getCameraPosition())
  }

  start(cursorX, cursorY) {
    this.#initialMousePosition[0] = cursorX
    this.#initialMousePosition[1] = cursorY

    this.#isStart = true
  }

  move(cursorX, cursorY) {
    if (!this.#isStart) return

    const dx = (this.#initialMousePosition[0] - cursorX) * 0.01
    const dy = (this.#initialMousePosition[1] - cursorY) * 0.01

    this.#rotation[1] += dx
    this.#rotation[0] += dy

    this.#initialMousePosition[0] = cursorX
    this.#initialMousePosition[1] = cursorY

    this.#changed = true
  }

  end() {
    this.#initialMousePosition[0] = 0
    this.#initialMousePosition[1] = 0
    this.#isStart = false
  }
}
