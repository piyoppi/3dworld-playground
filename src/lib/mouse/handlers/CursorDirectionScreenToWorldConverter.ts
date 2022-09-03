import { Mat3, Mat4, Vec3, MatrixArray3, VectorArray2 } from "../../Matrix.js"
import { Coordinate } from "../../Coordinate.js"

export class CursorDirectionScreenToWorldConverter {
  #transformMatrix: MatrixArray3

  constructor() {
    this.#transformMatrix = Mat3.getIdentityMatrix()
  }

  convert(mouseDelta: VectorArray2) {
    return Vec3.normalize(Mat3.mulVec3(this.#transformMatrix, [mouseDelta[0], mouseDelta[1], 0]))
  }

  calcTransformMatrix(targetCoordinate: Coordinate, cameraCoordinate: Coordinate) {
    const transform = Mat4.mulAll([
      targetCoordinate.getTransformMatrixFromWorldToCoordinate(),
      cameraCoordinate.getTransformMatrixToWorld()
    ])

    this.#transformMatrix = Mat4.convertToDirectionalTransformMatrix(transform)
  }
}
