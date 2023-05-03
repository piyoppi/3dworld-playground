import type { MouseButton, MouseControllable, MouseControllableCallbackFunction, WindowCursor } from "../../mouse/MouseControllable"
import { CursorNoneModifier } from "./cursorModifiers/CursorNoneModifier.js"
import type { CursorModifier } from "./cursorModifiers/CursorModifier"
import type { Coordinate } from "../../Coordinate.js"
import { CallbackFunctions } from "../../CallbackFunctions.js"
import type { Raycaster } from "../../Raycaster"
import { VectorArray3 } from "../../Matrix"
import { Colider } from "../../Colider"
import type { PositionApplyer, PositionChangable } from "./PositionChangable"

type StartingCallbackFunction = () => boolean

export class RaycastMoveHandler implements MouseControllable, PositionChangable {
  manipulateCoordinate: Coordinate
  #cursorModifier: CursorModifier
  #beforeUpdateCallbacks = new CallbackFunctions<() => void>()
  #startingCallbacks = new CallbackFunctions<StartingCallbackFunction>()
  #updatedCallbacks: Array<() => void> = []
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #raycaster: Raycaster<Colider>
  #markerRaycaster: Raycaster<Colider>
  #applyer: PositionApplyer = (coordinate: Coordinate, position: VectorArray3) => coordinate.position = position
  #isStart = false
  #targetColiders: Colider[]
  #handlingParams = {
    handledColiderUuid: ''
  }

  constructor(manipulateCoordinate: Coordinate, raycaster: Raycaster<Colider>, markerRaycaster: Raycaster<Colider>, targetColiders: Colider[] = []) {
    this.manipulateCoordinate = manipulateCoordinate
    this.#cursorModifier = new CursorNoneModifier()
    this.#raycaster = raycaster
    this.#markerRaycaster = markerRaycaster
    this.#targetColiders = targetColiders
  }

  get isStart() {
    return this.#isStart
  }

  setStartingCallback(func: StartingCallbackFunction) {
    this.#startingCallbacks.add(func)
  }

  setStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.add(func)
  }

  removeStartingCallback(func: StartingCallbackFunction) {
    this.#startingCallbacks.remove(func)
  }

  removeStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.remove(func)
  }

  addBeforeUpdateCallback(callback: () => void) {
    this.#beforeUpdateCallbacks.add(callback)
  }

  addUpdatedCallback(callback: () => void) {
    this.#updatedCallbacks.push(callback)
  }

  setCursorModifier(modifier: CursorModifier) {
    this.#cursorModifier = modifier
  }

  setApplyer(applyer: PositionApplyer) {
    this.#applyer = applyer
  }

  clearCursorModifier() {
    this.#cursorModifier = new CursorNoneModifier()
  }

  start(_param: WindowCursor, _button: MouseButton, _cameraCoordinate: Coordinate) {
    if (this.#targetColiders.length > 0 && !this.#targetColiders.find(colider => colider.uuid === this.#markerRaycaster.colidedDetails[0]?.colider?.uuid)) return
    if (this.#startingCallbacks.call().some(val => val === false)) return

    this.#isStart = true
    this.#cursorModifier.reset(this.manipulateCoordinate.position)
    this.#handlingParams.handledColiderUuid = this.#raycaster.colidedDetails[0].colider.uuid

    this.#startedCallbacks.call()
  }

  move() {
    if (!this.#isStart || !this.#raycaster.colided) return

    const colidedDetail = this.#raycaster.colidedDetails.find(item => item.colider.uuid === this.#handlingParams.handledColiderUuid)
    if (!colidedDetail) return

    this.#cursorModifier.setPosition(colidedDetail.position)

    const isChanged =
      this.manipulateCoordinate.x !== this.#cursorModifier.alignedPosition[0] ||
      this.manipulateCoordinate.y !== this.#cursorModifier.alignedPosition[1] ||
      this.manipulateCoordinate.z !== this.#cursorModifier.alignedPosition[2]

    if (isChanged) {
      this.#applyer(this.manipulateCoordinate, this.#cursorModifier.alignedPosition)

      this.#updatedCallbacks.forEach(callback => callback())
    }
  }

  end() {
    this.#isStart = false
  }
}
