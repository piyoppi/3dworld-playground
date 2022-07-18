import { Mat4, MatrixArray4, VectorArray3  } from './Matrix.js'

export class LookAtCameraHandler {
  #initialMousePosition
  #isStart
  #distance
  #rotation
  #target: VectorArray3
  #changed: boolean

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

  get changed() {
    return this.#changed
  }

  setTarget(x: number, y: number, z: number) {
    this.#target[0] = x
    this.#target[1] = y
    this.#target[2] = z

    this.#changed = true
  }

  addDistance(val: number) {
    this.#distance += val

    this.#changed = true
  }

  getCameraPosition(): VectorArray3 {
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

  start(cursorX: number, cursorY: number) {
    this.#initialMousePosition[0] = cursorX
    this.#initialMousePosition[1] = cursorY

    this.#isStart = true
  }

  move(cursorX: number, cursorY: number) {
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
