import type { MouseButton, MouseControllable, MouseControllableCallbackFunction } from "../../mouse/MouseControllable"
import { CallbackFunctions } from "../../CallbackFunctions.js"
import type { Coordinate } from "../../Coordinate.js"
import type { Raycaster } from "../../Raycaster"
import { CursorDirectionScreenToWorldConverter } from "./CursorDirectionScreenToWorldConverter.js"
import { Vec3, VectorArray3 } from "../../Matrix.js"

export class RotateHandler implements MouseControllable {
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #manipulateCoordinate: Coordinate
  #cursorDirectionConverter = new CursorDirectionScreenToWorldConverter()
  #isStart = false
  #raycaster: Raycaster
  #direction: VectorArray3
  #startPosition: VectorArray3 = [0, 0, 0]

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

  removeStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.remove(func)
  }

  start(cursorX: number, cursorY: number, _button: MouseButton, cameraCoordinate: Coordinate) {
    this.#cursorDirectionConverter.calcTransformMatrix(this.#manipulateCoordinate, cameraCoordinate)
    this.#isStart = true
    this.#startPosition = Vec3.normalize(this.#raycaster.colidedDetails[0].position)
    this.#startedCallbacks.call()
  }

  move(cursorX: number, cursorY: number) {
    if (this.#raycaster.colidedDetails.length === 0) return

    const position = Vec3.normalize(this.#raycaster.colidedDetails[0].position)
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
      angle = -angle
    }
    //console.log(this.#raycaster.colidedDetails, this.#raycaster.colidedDetails[0].colider.uuid, this.#raycaster.colidedDetails[0].position, angle)

    this.#manipulateCoordinate.rotate(this.#direction, angle)
  }

  end() {
    this.#isStart = false
  }
}
