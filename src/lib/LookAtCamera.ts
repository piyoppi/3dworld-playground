import { Mat4, Mat3, MatrixArray4, VectorArray3, MatrixArray3  } from './Matrix.js'
import { CursorTrackDifferentialCalculator } from "./mouse/CursorTrackDifferenceCalculator.js"
import { MouseButton, MouseControllableCallbackFunction, WindowCursor } from "./mouse/MouseControllable.js"
import { Coordinate } from './Coordinate.js'
import { CallbackFunctions } from './CallbackFunctions.js'

export type LookAtCameraHandlerMode = 'direction' | 'target'

class LookAtRotation {
  #rotation
  #cursorTrackDifference = new CursorTrackDifferentialCalculator()
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()

  constructor() {
    this.#rotation = [0, 0]
  }

  setStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.add(func)
  }

  removeStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.remove(func)
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
    return this.#cursorTrackDifference.isStart
  }

  get rotation() {
    return this.#rotation
  }

  start(screenX: number, screenY: number) {
    this.#cursorTrackDifference.start(screenX, screenY)
    this.#startedCallbacks.call()
  }

  move(screenX: number, screenY: number) {
    const [dx, dy] = this.#cursorTrackDifference.calculate(screenX, screenY)

    if (dx === 0 && dy === 0) return

    this.#rotation[1] += dx * 0.01
    this.#rotation[0] += dy * 0.01
  }

  end() {
    this.#cursorTrackDifference.end()
  }
}

class LookAtTarget {
  #target: VectorArray3
  #cursorTrackDifference = new CursorTrackDifferentialCalculator()
  #matrix: MatrixArray4
  #transformDirectionalMat: MatrixArray3
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()

  constructor() {
    this.#target = [0, 0, 0]
    this.#matrix = Mat4.getIdentityMatrix()
    this.#transformDirectionalMat = Mat3.getIdentityMatrix()
  }

  get isStart() {
    return this.#cursorTrackDifference.isStart
  }

  get target() {
    return this.#target
  }

  setStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.add(func)
  }

  removeStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.remove(func)
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

  setMatrix(val: MatrixArray4) {
    this.#matrix = val
    this.#transformDirectionalMat = Mat4.convertToDirectionalTransformMatrix(this.#matrix)
  }

  start(screenX: number, screenY: number) {
    this.#cursorTrackDifference.start(screenX, screenY)
    this.#startedCallbacks.call()
  }

  move(screenX: number, screenY: number) {
    const [dx, dy] = this.#cursorTrackDifference.calculate(screenX, screenY)

    if (dx === 0 && dy === 0) return

    const vec = Mat3.mulVec3(this.#transformDirectionalMat, [dx, dy, 0])

    this.#target[0] += vec[0] * 0.01
    this.#target[2] += vec[2] * 0.01
  }

  end() {
    this.#cursorTrackDifference.end()
  }
}

export class LookAtCamera {
  #distance
  #changed: boolean
  #isLocked: boolean
  #rotationHandler: LookAtRotation
  #targetPositionHandler: LookAtTarget
  #currentHandler: LookAtRotation | LookAtTarget
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()

  constructor() {
    this.#distance = 1
    this.#changed = false
    this.#isLocked = false
    this.#rotationHandler = new LookAtRotation()
    this.#targetPositionHandler = new LookAtTarget()
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
    return this.#currentHandler.isStart
  }

  setStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.add(func)
  }

  removeStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.remove(func)
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

  #getCameraPosition(): VectorArray3 {
    return [
      this.#targetPositionHandler.target[0] + this.#distance * Math.cos(this.#rotationHandler.rotation[0]) * Math.cos(this.#rotationHandler.rotation[1]),
      this.#targetPositionHandler.target[1] + this.#distance * Math.sin(this.#rotationHandler.rotation[0]),
      this.#targetPositionHandler.target[2] + this.#distance * Math.cos(this.#rotationHandler.rotation[0]) * Math.sin(this.#rotationHandler.rotation[1]),
    ]
  }

  getLookAtMatrix() {
    this.#changed = false
    return Mat4.lookAt(this.#targetPositionHandler.target, this.#getCameraPosition())
  }

  start(screenX: number, screenY: number) {
    this.#targetPositionHandler.setMatrix(Mat4.lookAt(this.#targetPositionHandler.target, this.#getCameraPosition()))
    this.#currentHandler.start(screenX, screenY)
    this.#startedCallbacks.call()
  }

  move(screenX: number, screenY: number) {
    if (this.#isLocked) {
      this.end()
      return
    }

    this.#currentHandler.move(screenX, screenY)

    this.#changed = true
  }

  wheel(delta: number) {
    this.addDistance(delta * 0.01)
  }

  end() {
    this.#currentHandler.end()
  }
}
