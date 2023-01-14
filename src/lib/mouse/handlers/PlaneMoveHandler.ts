import type { MouseButton, MouseControllable, MouseControllableCallbackFunction, WindowCursor } from "../../mouse/MouseControllable.js"
import type { CursorModifier } from "./cursorModifiers/CursorModifier.js"
import type { Coordinate } from "../../Coordinate"
import type { VectorArray3 } from "../../Matrix"
import type { Camera } from "../../Camera"
import { CallbackFunctions } from "../../CallbackFunctions.js"
import { Raycaster } from "../../Raycaster.js"
import { PlaneColider } from "../../Colider.js"

type StartingCallbackFunction = () => boolean

export class PlaneMoveHandler implements MouseControllable {
  manipulateCoordinate: Coordinate
  #isStart = false
  #direction: VectorArray3
  #startingCallbacks = new CallbackFunctions<StartingCallbackFunction>()
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #raycaster: Raycaster

  constructor(manipulateCoordinate: Coordinate, position: VectorArray3, directionInLocal: VectorArray3, camera: Camera) {
    this.manipulateCoordinate = manipulateCoordinate
    this.#direction = directionInLocal

    this.#raycaster = new Raycaster(camera)
    this.#raycaster.addTarget(new PlaneColider(manipulateCoordinate, directionInLocal))
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

  start(_cursor: WindowCursor, _button: MouseButton, _cameraCoordinate: Coordinate) {
    if (this.#startingCallbacks.call().some(val => val === false)) return

    this.#isStart = true

    this.#startedCallbacks.call()
  }

  move({normalizedX, normalizedY}: WindowCursor) {
    if (!this.#isStart) return

    this.#raycaster.check(normalizedX, normalizedY)
    if (this.#raycaster.colidedDetails.length === 0) return

    const position = this.#raycaster.colidedDetails[0].position

    this.manipulateCoordinate.x = position[0]
    this.manipulateCoordinate.y = position[1]
    this.manipulateCoordinate.z = position[2]
  }

  end() {
    this.#isStart = false
  }
}
