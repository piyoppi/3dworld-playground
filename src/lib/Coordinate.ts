import { Mat3, Mat4, MatrixArray4, Vec3, VectorArray3 } from './Matrix.js'
import { v4 as uuidv4 } from 'uuid'
import { Coordinates } from './Coordinates.js'
import { CallbackFunctions } from './CallbackFunctions.js'
import { Eular } from './Eular.js'

export class InvalidParentCoordinateError extends Error {}
export class DisposeError extends Error {}

export class Coordinate {
  protected _parent: Coordinate | null
  #children: Coordinates = new Coordinates()
  #matrix:  MatrixArray4
  #scaleMatrix: MatrixArray4
  #mirrorMatrix: MatrixArray4
  #beforeUpdateCallbacks = new CallbackFunctions<() => void>()
  #updatedCallbacks = new CallbackFunctions<() => void>()
  #constraintCallbacks = new CallbackFunctions<() => void>()
  #setChildCallback: (parent: Coordinate, child: Coordinate) => void
  #removeChildCallback: (parent: Coordinate, child: Coordinate) => void
  #uuid: string
  #disabledUpdateCallack = false

  constructor() {
    this._parent = null
    this.#uuid = uuidv4()
    this.#matrix = Mat4.getIdentityMatrix()
    this.#scaleMatrix = Mat4.getIdentityMatrix()
    this.#mirrorMatrix = Mat4.getIdentityMatrix()
    this.#setChildCallback = (_parent, _child) => {}
    this.#removeChildCallback = (_parent, _child) => {}
  }

  get matrix() {
    return Mat4.mulAll([this.#scaleMatrix, this.#mirrorMatrix, this.#matrix])
  }

  get matrixInverse() {
    return Mat4.inverse(this.#matrix)
  }

  get uuid() {
    return this.#uuid
  }

  get parent(): Coordinate | null {
    return this._parent
  }

  get children() {
    return this.#children
  }

  get xAxis() {
    return Vec3.normalize([this.#matrix[0], this.#matrix[1], this.#matrix[2]])
  }

  get yAxis() {
    return Vec3.normalize([this.#matrix[4], this.#matrix[5], this.#matrix[6]])
  }

  get zAxis() {
    return Vec3.normalize([this.#matrix[8], this.#matrix[9], this.#matrix[10]])
  }

  get eular() {
    return Eular.fromMatrix(Mat3.fromMatrixArray4(this.#matrix))
  }

  get hasConstraint() {
    return this.#constraintCallbacks.length > 0
  }

  setMatrix(array: MatrixArray4) {
    this.#matrix = array
    this.callUpdatedCallback()
  }

  getTransformMatrixToWorld(mat: MatrixArray4 = Mat4.getIdentityMatrix()) {
    let transform = Mat4.mul(this.#matrix, mat)

    if (this._parent) {
      transform = this._parent.getTransformMatrixToWorld(transform)
    }

    return transform
  }

  getTransformMatrixFromWorldToCoordinate(mat: MatrixArray4 = Mat4.getIdentityMatrix()) {
    let transform = Mat4.mul(mat, Mat4.inverse(this.#matrix))

    if (this._parent) {
      transform = this._parent.getTransformMatrixFromWorldToCoordinate(transform)
    }

    return transform
  }

  getGlobalPosition(position: VectorArray3 = [0, 0, 0]): VectorArray3 {
    return Mat4.mulGlVec3(this.getTransformMatrixToWorld(), position)
  }

  setBeforeUpdateCallback(func: () => void) {
    this.#beforeUpdateCallbacks.add(func)
  }

  setUpdateCallback(func: () => void) {
    this.#updatedCallbacks.add(func)
  }

  removeUpdateCallback(func: () => void) {
    this.#updatedCallbacks.remove(func)
  }

  setConstraintCallback(func: () => void) {
    this.#constraintCallbacks.add(func)
  }

  removeConstraintCallback(func: () => void) {
    this.#constraintCallbacks.remove(func)
  }

  setSetChildCallback(func: (parent: Coordinate, child: Coordinate) => void) {
    this.#setChildCallback = func
  }

  setRemoveChildCallback(func: (parent: Coordinate, child: Coordinate) => void) {
    this.#removeChildCallback = func
  }

  addChild(child: Coordinate) {
    if (child.parent) {
      throw new InvalidParentCoordinateError()
    }

    this.#children.push(child)
    child._parent = this

    this.#setChildCallback(this, child)
  }

  has(coordinate: Coordinate) {
    return coordinate.parent === this
  }

  removeChild(child: Coordinate) {
    const removed = this.#children.remove(child)
    if (!removed) return

    child._parent = null

    this.#removeChildCallback(this, child)
  }

  lookAt(targetPoint: VectorArray3) {
    this.#matrix = Mat4.lookAt(targetPoint, this.position)  
    this.callUpdatedCallback()
  }

  rotateX(rad: number) {
    this.#matrix = Mat4.mul(this.#matrix, Mat4.rotateX(rad))
    this.callUpdatedCallback()
  }

  rotateY(rad: number) {
    this.#matrix = Mat4.mul(this.#matrix, Mat4.rotateY(rad))
    this.callUpdatedCallback()
  }

  rotateZ(rad: number) {
    this.#matrix = Mat4.mul(this.#matrix, Mat4.rotateZ(rad))
    this.callUpdatedCallback()
  }

  rotate(direction: VectorArray3, angle: number) {
    const mat = Mat4.rotate(direction, angle)

    this.#matrix[0] = mat[0]
    this.#matrix[1] = mat[1]
    this.#matrix[2] = mat[2]
    this.#matrix[4] = mat[4]
    this.#matrix[5] = mat[5]
    this.#matrix[6] = mat[6]
    this.#matrix[8] = mat[8]
    this.#matrix[9] = mat[9]
    this.#matrix[10] = mat[10]

    this.callUpdatedCallback()
  }

  addRotate(direction: VectorArray3, angleDiff: number) {
    const mat = Mat4.rotate(direction, angleDiff)

    this.#matrix = Mat4.mul(this.#matrix, mat)
    this.callUpdatedCallback()
  }

  setDirectionYAxis(direction: VectorArray3, position: VectorArray3) {
    this.#matrix = Mat4.transformYAxis(direction, position)
    this.callUpdatedCallback()
  }

  setDirectionZAxis(direction: VectorArray3, position: VectorArray3) {
    this.#matrix = Mat4.transformZAxis(direction, position)
    this.callUpdatedCallback()
  }

  scale(a: VectorArray3) {
    this.#scaleMatrix = Mat4.scale(a[0], a[1], a[2])
    this.callUpdatedCallback()
  }

  mirrorZ() {
    this.#mirrorMatrix = Mat4.mirrorZ()
    this.callUpdatedCallback()
  }

  mirrorX() {
    this.#mirrorMatrix = Mat4.mirrorX()
    this.callUpdatedCallback()
  }

  mirrorY() {
    this.#mirrorMatrix = Mat4.mirrorY()
    this.callUpdatedCallback()
  }

  resetMirror() {
    this.#mirrorMatrix = Mat4.getIdentityMatrix()
    this.callUpdatedCallback()
  }

  private removeFromChild(coordinate: Coordinate) {
    this.removeChild(coordinate)
  }

  get position(): VectorArray3 {
    return [this.#matrix[12], this.#matrix[13], this.#matrix[14]]
  }

  set position(val: VectorArray3) {
    this.#matrix[12] = val[0]
    this.#matrix[13] = val[1]
    this.#matrix[14] = val[2]
    this.callUpdatedCallback()
  }

  set x(val) {
    this.#matrix[12] = val
    this.callUpdatedCallback()
  }
  set y(val) {
    this.#matrix[13] = val
    this.callUpdatedCallback()
  }
  set z(val) {
    this.#matrix[14] = val
    this.callUpdatedCallback()
  }

  //get items() { return this.#items }
  get x() { return this.#matrix[12] }
  get y() { return this.#matrix[13] }
  get z() { return this.#matrix[14] }

  private callUpdatedCallback() {
    if (this.#disabledUpdateCallack) return

    if (this.hasConstraint) {
      this.#disabledUpdateCallack = true
      this.#constraintCallbacks.call()
      this.#disabledUpdateCallack = false
    }

    this.#updatedCallbacks.call()
  }
}
