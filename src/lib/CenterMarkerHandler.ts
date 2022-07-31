import { Camera } from "./Camera.js"
import { Item } from "./Item.js"
import { MouseControllable, MouseDragHandler } from "./MouseDragHandler.js"
import { Mat3, Mat4, Vec3, MatrixArray3, VectorArray3 } from "./Matrix.js"

export class CenterMarkerHandler implements MouseControllable {
  #mouseDragHandler
  #manipulateItem: Item
  #planeXAxis: VectorArray3
  #planeYAxis: VectorArray3
  #scale: number
  #camera: Camera
  #transformMatrix: MatrixArray3

  constructor(manipulateItem: Item, planeXAxis: VectorArray3, planeYAxis: VectorArray3, scale: number, camera: Camera) {
    this.#mouseDragHandler = new MouseDragHandler()
    this.#manipulateItem = manipulateItem
    this.#planeXAxis = planeXAxis
    this.#planeYAxis = planeYAxis
    this.#camera = camera
    this.#scale = scale
    this.#transformMatrix = Mat3.getIdentityMatrix()
  }

  get isStart() {
    return this.#mouseDragHandler.isStart
  }

  start(cursorX: number, cursorY: number) {
    if (this.#mouseDragHandler.isStart) return

    this.#mouseDragHandler.start(cursorX, cursorY)
  }

  move(cursorX: number, cursorY: number) {
    if (!this.#mouseDragHandler.isStart) return

    const mouseDelta = this.#mouseDragHandler.move(cursorX, cursorY)
    const mouseDeltaInItemCoordinate = Vec3.normalize(Mat3.mulVec3(this.#transformMatrix, [mouseDelta[0], mouseDelta[1], 0]))
    const addingVector = [
      Vec3.dotprod(mouseDeltaInItemCoordinate, this.#planeXAxis) * this.#scale,
      Vec3.dotprod(mouseDeltaInItemCoordinate, this.#planeYAxis) * this.#scale,
      0
    ]

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
