import type { MouseButton, MouseControllable, MouseControllableCallbackFunction, WindowCursor } from "../../mouse/MouseControllable"
import type { Coordinate } from "../../Coordinate.js"
import type { ReadOnlyRaycaster } from "../../ReadOnlyRaycaster"
import type { Camera } from "../../Camera"
import { Raycaster } from "../../Raycaster.js"
import { CallbackFunctions } from "../../CallbackFunctions.js"
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
  #raycaster: ReadOnlyRaycaster<Colider>
  #direction: VectorArray3
  #startPosition: VectorArray3 = [0, 0, 0]
  #handlingParams = {
    initialAngle: 0,
    beforeAngle: 0
  }
  #planeColider: PlaneColider | null = null
  #planeRaycaster: Raycaster
  #targetColider: Colider

  constructor(manipulateCoordinate: Coordinate, raycaster: ReadOnlyRaycaster<Colider>, camera: Camera, direction: VectorArray3, targetColider: Colider) {
    this.#manipulateCoordinate = manipulateCoordinate
    this.#raycaster = raycaster
    this.#direction = direction
    this.#targetColider = targetColider
    this.#planeRaycaster = new Raycaster(camera)
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

    const colidedDetail = this.#raycaster.colidedDetails.find(val => val.colider.uuid === this.#targetColider.uuid)
    if (!colidedDetail) return

    this.#cursorDirectionConverter.calcTransformMatrix(this.#manipulateCoordinate, cameraCoordinate)
    this.#isStart = true
    this.#startPosition = Vec3.normalize(Vec3.subtract(colidedDetail.position, this.#manipulateCoordinate.position))

    this.#planeColider = new PlaneColider(this.#manipulateCoordinate, this.#direction)
    this.#planeRaycaster.addTarget(this.#planeColider)

    this.#handlingParams.initialAngle = Vec3.dotprod(
      this.#manipulateCoordinate.eular.toVectorArray3XYZ(),
      this.#direction
    )
    this.#handlingParams.beforeAngle = this.#handlingParams.initialAngle

    this.#startedCallbacks.call()
  }

  move({normalizedX, normalizedY}: WindowCursor) {
    const planeColider = this.#planeColider
    if (!planeColider) return

    this.#planeRaycaster.check(normalizedX, normalizedY)
    if (this.#planeRaycaster.colidedDetails.length === 0) return

    const colidedDetail = this.#planeRaycaster.colidedDetails.find(item => item.colider.uuid === planeColider.uuid)

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
      this.#planeRaycaster.removeTarget(this.#planeColider)
      this.#planeColider = null
    }
  }
}
