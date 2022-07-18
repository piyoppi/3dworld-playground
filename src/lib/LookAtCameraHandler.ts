import { Mat4, MatrixArray4, VectorArray3  } from './Matrix.js'
import { MouseDraggable, MouseDragHandler } from "./MouseDragHandler.js"

export class LookAtCameraHandler implements MouseDraggable {
  #mouseDragHandler
  #distance
  #rotation
  #target: VectorArray3
  #changed: boolean
  #isLocked: boolean

  constructor() {
    this.#mouseDragHandler = new MouseDragHandler()
    this.#distance = 1
    this.#rotation = [0, 0]
    this.#target = [0, 0, 0]
    this.#changed = false
    this.#isLocked = false
  }

  get distance() {
    return this.#distance
  }

  get changed() {
    return this.#changed
  }

  get isLocked() {
    return this.#isLocked
  }

  set isLocked(value: boolean) {
    this.#isLocked = value
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
    this.#mouseDragHandler.start(cursorX, cursorY)
  }

  move(cursorX: number, cursorY: number) {
    if (this.#isLocked && this.#mouseDragHandler.isStart) {
      this.end()

      return
    }

    const [dx, dy] = this.#mouseDragHandler.move(cursorX, cursorY)

    if (dx === 0 && dy === 0) return

    this.#rotation[1] += dx
    this.#rotation[0] += dy

    this.#changed = true
  }

  end() {
    this.#mouseDragHandler.end()
  }
}
