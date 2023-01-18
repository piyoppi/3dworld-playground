import type { MouseButton, MouseControllable, MouseControllableCallbackFunction, WindowCursor } from "../../mouse/MouseControllable.js"
import type { Coordinate } from "../../Coordinate"
import { CursorNoneModifier } from "./cursorModifiers/CursorNoneModifier.js"
import type { CursorModifier } from "./cursorModifiers/CursorModifier"
import { Vec3, VectorArray3 } from "../../Matrix.js"
import type { Camera } from "../../Camera"
import { CallbackFunctions } from "../../CallbackFunctions.js"
import { Raycaster } from "../../Raycaster.js"
import { PlaneColider } from "../../Colider.js"
import type { PositionApplyer, PositionChangable } from "./PositionChangable"

type StartingCallbackFunction = () => boolean

export class PlaneMoveHandler implements MouseControllable, PositionChangable {
  manipulateCoordinate: Coordinate
  #cursorModifier: CursorModifier
  #isStart = false
  #startingCallbacks = new CallbackFunctions<StartingCallbackFunction>()
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #raycaster: Raycaster
  #offset: VectorArray3 = [0, 0, 0]
  #applyer: PositionApplyer = (coordinate: Coordinate, position: VectorArray3) => coordinate.position = position

  constructor(manipulateCoordinate: Coordinate, direction: VectorArray3, inLocal: boolean, camera: Camera) {
    this.manipulateCoordinate = manipulateCoordinate
    this.#cursorModifier = new CursorNoneModifier()

    this.#raycaster = new Raycaster(camera)
    this.#raycaster.addTarget(new PlaneColider(manipulateCoordinate, direction, inLocal))
  }

  get isStart() {
    return this.#isStart
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

  setCursorModifier(modifier: CursorModifier) {
    this.#cursorModifier = modifier
  }

  clearCursorModifier() {
    this.#cursorModifier = new CursorNoneModifier()
  }

  setApplyer(applyer: PositionApplyer) {
    this.#applyer = applyer
  }

  start({normalizedX, normalizedY}: WindowCursor, _button: MouseButton, _cameraCoordinate: Coordinate) {
    if (this.#startingCallbacks.call().some(val => val === false)) return

    this.#raycaster.check(normalizedX, normalizedY)
    if (this.#raycaster.colidedDetails.length === 0) return

    this.#offset = Vec3.subtract(this.manipulateCoordinate.position, this.#raycaster.colidedDetails[0].position)

    this.#isStart = true
    this.#cursorModifier.reset(this.manipulateCoordinate.position)

    this.#startedCallbacks.call()
  }

  move({normalizedX, normalizedY}: WindowCursor) {
    if (!this.#isStart) return

    this.#raycaster.check(normalizedX, normalizedY)
    if (this.#raycaster.colidedDetails.length === 0) return

    const position = Vec3.add(this.#raycaster.colidedDetails[0].position, this.#offset)

    this.#cursorModifier.setPosition(position)

    const isChanged =
      this.manipulateCoordinate.x !== this.#cursorModifier.alignedPosition[0] ||
      this.manipulateCoordinate.y !== this.#cursorModifier.alignedPosition[1] ||
      this.manipulateCoordinate.z !== this.#cursorModifier.alignedPosition[2]

    if (isChanged) {
      this.#applyer(this.manipulateCoordinate, this.#cursorModifier.alignedPosition)
    }
  }

  end() {
    this.#isStart = false
  }
}
