import { Mat4, VectorArray3  } from './Matrix.js'
import { MouseControllable, MouseDragHandler } from "./mouse/MouseDragHandler.js"

export type LookAtCameraHandlerMode = 'direction' | 'target'

class LookAtRotation implements MouseControllable {
  #rotation
  #mouseDragHandler

  constructor(mouseDragHandler: MouseDragHandler) {
    this.#rotation = [0, 0]
    this.#mouseDragHandler = mouseDragHandler
  }

  setXYRotation(value: number) {
    this.#rotation[1] = value
  }

  setYZRotation(value: number) {
    if (value > Math.PI / 2 - 0.001) {
      value = Math.PI / 2 - 0.001
    }

    this.#rotation[0] = value
  }

  addXYRotation(value: number) {
    this.setXYRotation(this.#rotation[1] + value)
  }

  addYZRotation(value: number) {
    this.setYZRotation(this.#rotation[0] + value)
  }

  get isStart() {
    return this.#mouseDragHandler.isStart
  }

  get rotation() {
    return this.#rotation
  }

  start(cursorX: number, cursorY: number) {
    this.#mouseDragHandler.start(cursorX, cursorY)
  }

  move(cursorX: number, cursorY: number) {
    const [dx, dy] = this.#mouseDragHandler.move(cursorX, cursorY)

    if (dx === 0 && dy === 0) return

    this.#rotation[1] += dx * 0.01
    this.#rotation[0] += dy * 0.01
  }

  end() {
    this.#mouseDragHandler.end()
  }
}

class LookAtTarget implements MouseControllable {
  #target: VectorArray3
  #mouseDragHandler

  constructor(mouseDragHandler: MouseDragHandler) {
    this.#target = [0, 0, 0]
    this.#mouseDragHandler = mouseDragHandler
  }

  get isStart() {
    return this.#mouseDragHandler.isStart
  }

  get target() {
    return this.#target
  }

  addTargetX(val: number) {
    this.#target[0] += val
  }

  addTargetY(val: number) {
    this.#target[1] += val
  }

  addTargetZ(val: number) {
    this.#target[2] += val
  }

  setTarget(x: number, y: number, z: number) {
    this.#target[0] = x
    this.#target[1] = y
    this.#target[2] = z
  }

  start(cursorX: number, cursorY: number) {
    this.#mouseDragHandler.start(cursorX, cursorY)
  }

  move(cursorX: number, cursorY: number) {
    const [dx, dy] = this.#mouseDragHandler.move(cursorX, cursorY)

    if (dx === 0 && dy === 0) return

    this.#target[2] += dx * 0.01
    this.#target[0] += dy * 0.01
  }

  end() {
    this.#mouseDragHandler.end()
  }
}

export class LookAtCameraHandler implements MouseControllable {
  #mouseDragHandler
  #distance
  #changed: boolean
  #isLocked: boolean
  #rotationHandler: LookAtRotation
  #targetPositionHandler: LookAtTarget
  #currentHandler: MouseControllable

  constructor() {
    this.#mouseDragHandler = new MouseDragHandler()
    this.#distance = 1
    this.#changed = false
    this.#isLocked = false
    this.#rotationHandler = new LookAtRotation(this.#mouseDragHandler)
    this.#targetPositionHandler = new LookAtTarget(this.#mouseDragHandler)
    this.#currentHandler = this.#rotationHandler
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

  get rotation() {
    return this.#rotationHandler.rotation
  }

  get isStart() {
    return this.#mouseDragHandler.isStart
  }

  setRotationHandler() {
    if (this.#currentHandler.isStart) return
    this.#currentHandler = this.#rotationHandler
  }

  setTargetPositionHandler() {
    if (this.#currentHandler.isStart) return
    this.#currentHandler = this.#targetPositionHandler
  }

  setXYRotation(value: number) {
    this.#rotationHandler.setXYRotation(value)
    this.#changed = true
  }

  setYZRotation(value: number) {
    this.#rotationHandler.setYZRotation(value)
    this.#changed = true
  }

  addXYRotation(value: number) {
    this.#rotationHandler.addXYRotation(value)
    this.#changed = true
  }

  addYZRotation(value: number) {
    this.#rotationHandler.addYZRotation(value)
    this.#changed = true
  }

  setTarget(x: number, y: number, z: number) {
    this.#targetPositionHandler.setTarget(x, y, z)
    this.#changed = true
  }

  addTargetX(val: number) {
    this.#targetPositionHandler.addTargetX(val)
    this.#changed = true
  }

  setTargetY(val: number) {
    this.#targetPositionHandler.addTargetY(val)
    this.#changed = true
  }

  setTargetZ(val: number) {
    this.#targetPositionHandler.addTargetZ(val)
    this.#changed = true
  }

  addDistance(val: number) {
    this.#distance += val
    this.#changed = true
  }

  getCameraPosition(): VectorArray3 {
    return [
      this.#targetPositionHandler.target[0] + this.#distance * Math.cos(this.#rotationHandler.rotation[0]) * Math.cos(this.#rotationHandler.rotation[1]),
      this.#targetPositionHandler.target[1] + this.#distance * Math.sin(this.#rotationHandler.rotation[0]),
      this.#targetPositionHandler.target[2] + this.#distance * Math.cos(this.#rotationHandler.rotation[0]) * Math.sin(this.#rotationHandler.rotation[1]),
    ]
  }

  getLookAtMatrix() {
    this.#changed = false
    return Mat4.lookAt(this.#targetPositionHandler.target, this.getCameraPosition())
  }

  start(cursorX: number, cursorY: number) {
    this.#currentHandler.start(cursorX, cursorY)
  }

  move(cursorX: number, cursorY: number) {
    if (this.#isLocked) {
      this.end()
      return
    }

    this.#currentHandler.move(cursorX, cursorY)

    this.#changed = true
  }

  end() {
    this.#currentHandler.end()
  }
}
