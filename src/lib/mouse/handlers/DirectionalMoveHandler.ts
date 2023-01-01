import type { MouseButton, MouseControllable, MouseControllableCallbackFunction } from "../../mouse/MouseControllable.js"
import type { CursorModifier } from "./cursorModifiers/CursorModifier.js"
import type { Coordinate } from "../../Coordinate"
import { Vec3, VectorArray3 } from "../../Matrix.js"
import { CursorNoneModifier } from "./cursorModifiers/CursorNoneModifier.js"
import { CursorDirectionScreenToWorldConverter } from "./CursorDirectionScreenToWorldConverter.js"
import { CursorTrackDifferentialCalculator } from "../../mouse/CursorTrackDifferenceCalculator.js"
import { CallbackFunctions } from "../../CallbackFunctions.js"
import { Mat4, Mat3 } from "../../Matrix.js"

type StartingCallbackFunction = () => boolean

export class DirectionalMoveHandler implements MouseControllable {
  manipulateCoordinate: Coordinate
  #cursorTrackDifference = new CursorTrackDifferentialCalculator()
  #direction: VectorArray3
  #scale: number
  #cursorDirectionConverter: CursorDirectionScreenToWorldConverter
  #cursorModifier: CursorModifier 
  #startingCallbacks = new CallbackFunctions<StartingCallbackFunction>()
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()

  constructor(manipulateCoordinate: Coordinate, directionInLocal: VectorArray3, scale: number) {
    this.manipulateCoordinate = manipulateCoordinate
    this.#direction = directionInLocal
    this.#scale = scale
    this.#cursorDirectionConverter = new CursorDirectionScreenToWorldConverter()
    this.#cursorModifier = new CursorNoneModifier()
  }

  get isStart() {
    return this.#cursorTrackDifference.isStart
  }

  setStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.add(func)
  }

  setStartingCallback(func: StartingCallbackFunction) {
    this.#startingCallbacks.add(func)
  }

  removeStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.remove(func)
  }

  removeStartingCallback(func: StartingCallbackFunction) {
    this.#startingCallbacks.remove(func)
  }

  setCursorModifier(cursorModifier: CursorModifier) {
    this.#cursorModifier = cursorModifier
  }

  start(cursorX: number, cursorY: number, _button: MouseButton, cameraCoordinate: Coordinate) {
    if (this.#startingCallbacks.call().some(val => val === false)) return
    if (this.#cursorTrackDifference.isStart) return

    this.#cursorModifier.reset(this.manipulateCoordinate.position)
    this.#cursorTrackDifference.start(cursorX, cursorY)
    this.#cursorDirectionConverter.calcTransformMatrix(this.manipulateCoordinate, cameraCoordinate)

    this.#startedCallbacks.call()
  }

  move(cursorX: number, cursorY: number) {
    if (!this.#cursorTrackDifference.isStart) return

    const directionInWorld = Mat3.mulVec3(Mat4.convertToDirectionalTransformMatrix(this.manipulateCoordinate.getTransformMatrixToWorld()), this.#direction)

    const mouseDelta = this.#cursorTrackDifference.calculate(cursorX, cursorY)
    const mouseDeltaInItemCoordinate = this.#cursorDirectionConverter.convert(mouseDelta)
    const len = Vec3.dotprod(mouseDeltaInItemCoordinate, directionInWorld)
    const scale = len * this.#scale
    const addingVector = Vec3.mulScale(directionInWorld, scale)

    this.#cursorModifier.add(addingVector)

    this.manipulateCoordinate.x = this.#cursorModifier.alignedPosition[0]
    this.manipulateCoordinate.y = this.#cursorModifier.alignedPosition[1]
    this.manipulateCoordinate.z = this.#cursorModifier.alignedPosition[2]
  }

  end() {
    this.#cursorTrackDifference.end()
  }
}
