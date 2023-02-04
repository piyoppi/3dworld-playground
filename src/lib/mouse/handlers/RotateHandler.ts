import type { MouseButton, MouseControllable, MouseControllableCallbackFunction, WindowCursor } from "../../mouse/MouseControllable"
import { CallbackFunctions } from "../../CallbackFunctions.js"
import type { Coordinate } from "../../Coordinate.js"
import type { Raycaster } from "../../Raycaster"
import { CursorDirectionScreenToWorldConverter } from "./CursorDirectionScreenToWorldConverter.js"
import { Mat4, Mat3, Vec3, VectorArray3 } from "../../Matrix.js"
import { Colider, PlaneColider } from "../../Colider.js"

type StartingCallbackFunction = () => boolean

export class RotateHandler implements MouseControllable {
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #startingCallbacks = new CallbackFunctions<StartingCallbackFunction>()
  #manipulateCoordinate: Coordinate
  #cursorDirectionConverter = new CursorDirectionScreenToWorldConverter()
  #isStart = false
  #raycaster: Raycaster<Colider>
  #direction: VectorArray3
  #startPosition: VectorArray3 = [0, 0, 0]
  #handlingParams = {
    initialAngle: 0,
    beforeAngle: 0
  }
  #planeColider: PlaneColider | null = null
  #targetColider: Colider

  constructor(manipulateCoordinate: Coordinate, raycaster: Raycaster<Colider>, direction: VectorArray3, targetColider: Colider) {
    this.#manipulateCoordinate = manipulateCoordinate
    this.#raycaster = raycaster
    this.#direction = direction
    this.#targetColider = targetColider
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

  start(_params: WindowCursor, _button: MouseButton, cameraCoordinate: Coordinate) {
    if (this.#startingCallbacks.call().some(val => val === false)) return
    if (this.#raycaster.colidedDetails[0].colider.uuid !== this.#targetColider.uuid) return

    this.#cursorDirectionConverter.calcTransformMatrix(this.#manipulateCoordinate, cameraCoordinate)
    this.#isStart = true
    this.#startPosition = Vec3.normalize(Vec3.subtract(this.#raycaster.colidedDetails[0].position, this.#manipulateCoordinate.position))

    this.#planeColider = new PlaneColider(this.#manipulateCoordinate, this.#direction)
    this.#raycaster.addTarget(this.#planeColider)

    this.#handlingParams.initialAngle = Vec3.dotprod(
      this.#manipulateCoordinate.eular.toVectorArray3XYZ(),
      this.#direction
    )
    this.#handlingParams.beforeAngle = this.#handlingParams.initialAngle

    this.#startedCallbacks.call()
  }

  move(_params: WindowCursor) {
    const planeColider = this.#planeColider
    if (!planeColider) return
    if (this.#raycaster.colidedDetails.length === 0) return

    const colidedDetail = this.#raycaster.colidedDetails.find(item => item.colider.uuid === planeColider.uuid)

    if (!colidedDetail) return

    const position = Vec3.normalize(Vec3.subtract(colidedDetail.position, this.#manipulateCoordinate.position))
    const directionInWorld = Mat3.mulVec3(Mat4.convertToDirectionalTransformMatrix(this.#manipulateCoordinate.getTransformMatrixToWorld()), this.#direction)

    let modVector = 
      Vec3.normalize(
        Vec3.add(
          position,
          Vec3.mulScale(
            directionInWorld,
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

    if (Vec3.dotprod(Vec3.cross(modVector, this.#startPosition), directionInWorld) > 0) {
      angle = -angle + this.#handlingParams.initialAngle
    } else {
      angle = angle + this.#handlingParams.initialAngle
    }

    this.#manipulateCoordinate.addRotate(this.#direction, angle - this.#handlingParams.beforeAngle)
    this.#handlingParams.beforeAngle = angle
  }

  end() {
    this.#isStart = false
    if (this.#planeColider) {
      this.#raycaster.removeTarget(this.#planeColider)
      this.#planeColider = null
    }
  }
}
