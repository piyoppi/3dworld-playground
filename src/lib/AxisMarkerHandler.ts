import { Camera } from "./Camera.js"
import { Item } from "./Item.js"
import { Mat3, Mat4, Vec2, Vec3, MatrixArray3, VectorArray2, VectorArray3 } from "./Matrix.js"
import { MouseDraggable, MouseDragHandler } from "./MouseDragHandler.js"

export class AxisMarkerHandler implements MouseDraggable  {
  #axisItem: Item
  #manipulateItem: Item
  #mouseDragHandler
  #direction: VectorArray3
  #scale: number
  #camera: Camera
  #transformMatrix: MatrixArray3

  constructor(axisItem: Item, manipulateItem: Item, directionInLocal: VectorArray3, scale: number, camera: Camera) {
    this.#mouseDragHandler = new MouseDragHandler()
    this.#axisItem = axisItem
    this.#manipulateItem = manipulateItem
    this.#direction = directionInLocal
    this.#scale = scale
    this.#camera = camera
    this.#transformMatrix = Mat3.getIdentityMatrix()
  }

  start(cursorX: number, cursorY: number) {
    if (this.#mouseDragHandler.isStart) return

    this.#mouseDragHandler.start(cursorX, cursorY)
    this.calcTransformMatrix()
  }

  move(cursorX: number, cursorY: number) {
    if (!this.#mouseDragHandler.isStart) return

    const mouseDelta = this.#mouseDragHandler.move(cursorX, cursorY)
    const mouseDeltaInItemCoordinate = Vec3.normalize(Mat3.mulVec3(this.#transformMatrix, [-mouseDelta[0], mouseDelta[1], 0]))
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
      this.#manipulateItem.parentCoordinate.getTransformMatrixToWorld(),
      this.#camera.coordinate.getTransformMatrixFromWorldToCoordinate(),
      this.#camera.projectionMatrix,
    ])

    this.#transformMatrix = Mat4.convertToDirectionalTransformMatrix(transform)
  }
}
