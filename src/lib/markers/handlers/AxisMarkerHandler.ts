import { Camera } from "../../Camera.js"
import { Item } from "../../Item.js"
import { Mat3, Mat4, Vec3, MatrixArray3, VectorArray3 } from "../../Matrix.js"
import { MouseControllable, MouseDragHandler } from "../../mouse/MouseDragHandler.js"

export class AxisMarkerHandler implements MouseControllable {
  #manipulateItem: Item
  #mouseDragHandler
  #direction: VectorArray3
  #scale: number
  #camera: Camera
  #transformMatrix: MatrixArray3

  constructor(manipulateItem: Item, directionInLocal: VectorArray3, scale: number, camera: Camera) {
    this.#mouseDragHandler = new MouseDragHandler()
    this.#manipulateItem = manipulateItem
    this.#direction = directionInLocal
    this.#scale = scale
    this.#camera = camera
    this.#transformMatrix = Mat3.getIdentityMatrix()
  }

  get isStart() {
    return this.#mouseDragHandler.isStart
  }

  start(cursorX: number, cursorY: number) {
    if (this.#mouseDragHandler.isStart) return

    this.#mouseDragHandler.start(cursorX, cursorY)
    this.calcTransformMatrix()
  }

  move(cursorX: number, cursorY: number) {
    if (!this.#mouseDragHandler.isStart) return

    const mouseDelta = this.#mouseDragHandler.move(cursorX, cursorY)
    const mouseDeltaInItemCoordinate = Vec3.normalize(Mat3.mulVec3(this.#transformMatrix, [mouseDelta[0], mouseDelta[1], 0]))
    const len = Vec3.dotprod(mouseDeltaInItemCoordinate, this.#direction)
    const scale = len * this.#scale
    const addingVector = Vec3.mulScale(this.#direction, scale)

    this.#manipulateItem.parentCoordinate.x += addingVector[0]
    this.#manipulateItem.parentCoordinate.y += addingVector[1]
    this.#manipulateItem.parentCoordinate.z += addingVector[2]
  }

  end() {
    this.#mouseDragHandler.end()
  }

  private calcTransformMatrix() {
    const transform = Mat4.mulAll([
      this.#manipulateItem.parentCoordinate.getTransformMatrixFromWorldToCoordinate(),
      this.#camera.coordinate.getTransformMatrixToWorld()
    ])

    this.#transformMatrix = Mat4.convertToDirectionalTransformMatrix(transform)
  }
}
