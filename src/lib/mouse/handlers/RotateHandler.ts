import type { MouseButton, MouseControllable, MouseControllableCallbackFunction } from "../../mouse/MouseControllable"
import { CallbackFunctions } from "../../CallbackFunctions.js"
import type { Coordinate } from "../../Coordinate.js"
import type { Raycaster } from "../../Raycaster"
import { CursorDirectionScreenToWorldConverter } from "./CursorDirectionScreenToWorldConverter.js"
import { Vec3, VectorArray3 } from "../../Matrix.js"

type StartingCallbackFunction = () => boolean

export class RotateHandler implements MouseControllable {
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #startingCallbacks = new CallbackFunctions<StartingCallbackFunction>()
  #manipulateCoordinate: Coordinate
  #cursorDirectionConverter = new CursorDirectionScreenToWorldConverter()
  #isStart = false
  #raycaster: Raycaster
  #direction: VectorArray3
  #startPosition: VectorArray3 = [0, 0, 0]
  #handlingParams = {
    handledColiderUuid: '',
    initialAngle: 0
  }

  constructor(manipulateCoordinate: Coordinate, raycaster: Raycaster, direction: VectorArray3) {
    this.#manipulateCoordinate = manipulateCoordinate
    this.#raycaster = raycaster
    this.#direction = direction
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

  start(cursorX: number, cursorY: number, _button: MouseButton, cameraCoordinate: Coordinate) {
    if (this.#startingCallbacks.call().some(val => val === false)) return

    this.#cursorDirectionConverter.calcTransformMatrix(this.#manipulateCoordinate, cameraCoordinate)
    this.#isStart = true
    this.#startPosition = Vec3.normalize(this.#raycaster.colidedDetails[0].position)

    this.#handlingParams.handledColiderUuid = this.#raycaster.colidedDetails[0].colider.uuid
    this.#handlingParams.initialAngle = Vec3.dotprod(
      this.#manipulateCoordinate.eular.toVectorArray3XYZ(),
      this.#direction
    )
    console.log(this.#handlingParams.initialAngle, this.#manipulateCoordinate.eular.toVectorArray3(), this.#direction)

    this.#startedCallbacks.call()
  }

  move(cursorX: number, cursorY: number) {
    if (this.#raycaster.colidedDetails.length === 0) return

    const colidedDetail = this.#raycaster.colidedDetails.find(item => item.colider.uuid === this.#handlingParams.handledColiderUuid)

    if (!colidedDetail) return

    const position = Vec3.normalize(colidedDetail.position)
    //this.#manipulateCoordinate.lookAt(position)

    let modVector = 
      Vec3.normalize(
        Vec3.add(
          position,
          Vec3.mulScale(
            this.#direction,
            Math.sin(Math.acos(Vec3.dotprod(this.#startPosition, position)))
          )
        )
      )

    let angle = Math.acos(
      Vec3.dotprod(
        this.#startPosition,
        modVector
      )
    )

    if (Vec3.dotprod(Vec3.cross(modVector, this.#startPosition), this.#direction) > 0) {
      angle = -angle + this.#handlingParams.initialAngle
    } else {
      angle = angle + this.#handlingParams.initialAngle
    }
    console.log(angle)

    this.#manipulateCoordinate.rotate(this.#direction, angle)
  }

  end() {
    this.#isStart = false
    this.#handlingParams.handledColiderUuid = ''
  }
}
