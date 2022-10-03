import { Item } from './Item.js'
import { Mat4, MatrixArray4, Vec3, VectorArray3 } from './Matrix.js'
import { v4 as uuidv4 } from 'uuid'
import { Coordinates } from './Coordinates.js'
import { CallbackFunctions } from './CallbackFunctions.js'

export class InvalidParentCoordinateError extends Error {}

export class Coordinate {
  #items: Array<Item>
  protected _parent: Coordinate | null
  #children: Coordinates = new Coordinates()
  #matrix:  MatrixArray4
  #scaleMatrix: MatrixArray4
  #updatedCallbacks = new CallbackFunctions<() => void>()
  #setChildCallback: (parent: Coordinate, child: Coordinate) => void
  #removeChildCallback: (parent: Coordinate, child: Coordinate) => void
  #uuid: string

  constructor() {
    this._parent = null
    this.#uuid = uuidv4()
    this.#items = []
    this.#matrix = Mat4.getIdentityMatrix()
    this.#scaleMatrix = Mat4.getIdentityMatrix()
    this.#setChildCallback = (_parent, _child) => {}
    this.#removeChildCallback = (_parent, _child) => {}
  }

  get matrix() {
    return Mat4.mul(this.#matrix, this.#scaleMatrix)
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

  setMatrix(array: MatrixArray4) {
    this.#matrix = array
    this.#updatedCallbacks.call()
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

  setUpdateCallback(func: () => void) {
    this.#updatedCallbacks.add(func)
  }

  setSetChildCallback(func: (parent: Coordinate, child: Coordinate) => void) {
    this.#setChildCallback = func
  }

  setRemoveChildCallback(func: (parent: Coordinate, child: Coordinate) => void) {
    this.#removeChildCallback = func
  }

  addItem(item: Item) {
    if (this.#items.find(has => has.uuid === item.uuid)) return

    this.#items.push(item)
    if (!item.parentCoordinate || item.parentCoordinate.uuid !== this.uuid) {
      item.parentCoordinate = this
    }
  }

  addChild(child: Coordinate) {
    if (child.parent) {
      throw new InvalidParentCoordinateError()
    }

    this.#children.push(child)
    child._parent = this

    this.#setChildCallback(this, child)
  }

  removeChild(child: Coordinate) {
    const removed = this.#children.remove(child)
    if (!removed) return

    child._parent = null

    this.#removeChildCallback(this, child)
  }

  static create(items: Array<Item>): Coordinate {
    const coordinate = new Coordinate()

    items.forEach(item => coordinate.addItem(item))

    return coordinate
  }

  lookAt(targetPoint: VectorArray3) {
    this.#matrix = Mat4.lookAt(targetPoint, this.position)  
  }

  rotateX(rad: number) {
    this.#matrix = Mat4.mul(this.#matrix, Mat4.rotateX(rad))
    this.#updatedCallbacks.call()
  }

  rotateY(rad: number) {
    this.#matrix = Mat4.mul(this.#matrix, Mat4.rotateY(rad))
    this.#updatedCallbacks.call()
  }

  rotateZ(rad: number) {
    this.#matrix = Mat4.mul(this.#matrix, Mat4.rotateZ(rad))
    this.#updatedCallbacks.call()
  }

  setDirectionYAxis(direction: VectorArray3, position: VectorArray3) {
    this.#matrix = Mat4.transformYAxis(direction, position)
    this.#updatedCallbacks.call()
  }

  setDirectionZAxis(direction: VectorArray3, position: VectorArray3) {
    this.#matrix = Mat4.transformZAxis(direction, position)
    this.#updatedCallbacks.call()
  }

  scale(a: VectorArray3) {
    this.#scaleMatrix = Mat4.scale(a[0], a[1], a[2])
    this.#updatedCallbacks.call()
  }

  get position(): VectorArray3 {
    return [this.#matrix[12], this.#matrix[13], this.#matrix[14]]
  }

  set position(val: VectorArray3) {
    this.#matrix[12] = val[0]
    this.#matrix[13] = val[1]
    this.#matrix[14] = val[2]
    this.#updatedCallbacks.call()
  }

  set x(val) {
    this.#matrix[12] = val
    this.#updatedCallbacks.call()
  }
  set y(val) {
    this.#matrix[13] = val
    this.#updatedCallbacks.call()
  }
  set z(val) {
    this.#matrix[14] = val
    this.#updatedCallbacks.call()
  }

  get items() { return this.#items }
  get x() { return this.#matrix[12] }
  get y() { return this.#matrix[13] }
  get z() { return this.#matrix[14] }
}
