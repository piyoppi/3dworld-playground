import { Item } from './Item.js'
import { Mat4, MatrixArray4, VectorArray3 } from './Matrix.js'
import { v4 as uuidv4 } from 'uuid'

export class InvalidParentCoordinateError extends Error {}

export class Coordinate {
  #items: Array<Item>
  protected _parent: Coordinate | null
  #children: Array<Coordinate>
  #matrix:  MatrixArray4
  #updatedCallback: () => void
  #setChildCallback: (parent: Coordinate, child: Coordinate) => void
  #removeChildCallback: (parent: Coordinate, child: Coordinate) => void
  #uuid: string

  constructor() {
    this._parent = null
    this.#uuid = uuidv4()
    this.#children = []
    this.#items = []
    this.#matrix = Mat4.getIdentityMatrix()
    this.#updatedCallback = () => {}
    this.#setChildCallback = (parent, child) => {}
    this.#removeChildCallback = (parent, child) => {}
  }

  get matrix() {
    return this.#matrix
  }

  set matrix(array) {
    this.#matrix = array
    this.#updatedCallback()
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

  getTransformMatrixToWorld(mat: MatrixArray4 = Mat4.getIdentityMatrix()) {
    let transform = Mat4.mul(this.matrix, mat)

    if (this._parent) {
      transform = this._parent.getTransformMatrixToWorld(transform)
    }

    return transform
  }

  getTransformMatrixFromWorldToCoordinate(mat: MatrixArray4 = Mat4.getIdentityMatrix()) {
    let transform = Mat4.mul(mat, Mat4.inverse(this.matrix))

    if (this._parent) {
      transform = this._parent.getTransformMatrixFromWorldToCoordinate(transform)
    }

    return transform
  }

  getGlobalPosition(position: VectorArray3 = [0, 0, 0]): VectorArray3 {
    return Mat4.mulGlVec3(this.getTransformMatrixToWorld(), position)
  }

  setUpdateCallback(func: () => void) {
    this.#updatedCallback = func
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
    const index = this.#children.findIndex(coord => coord.uuid === child.uuid)
    if (index < 0) return

    this.#children.splice(index, 1)
    child._parent = null

    this.#removeChildCallback(this, child)
  }

  static create(items: Array<Item>): Coordinate {
    const coordinate = new Coordinate()

    items.forEach(item => coordinate.addItem(item))

    return coordinate
  }

  lookAt(targetPoint: VectorArray3) {
    this.matrix = Mat4.lookAt(targetPoint, this.position)  
  }

  rotateX(rad: number) {
    this.matrix = Mat4.mul(this.matrix, Mat4.rotateX(rad))
  }

  rotateY(rad: number) {
    this.matrix = Mat4.mul(this.matrix, Mat4.rotateY(rad))
  }

  rotateZ(rad: number) {
    this.matrix = Mat4.mul(this.matrix, Mat4.rotateZ(rad))
  }

  get position(): VectorArray3 {
    return [this.matrix[12], this.matrix[13], this.matrix[14]]
  }

  set x(val) {
    this.matrix[12] = val
    this.#updatedCallback()
  }
  set y(val) {
    this.matrix[13] = val
    this.#updatedCallback()
  }
  set z(val) {
    this.matrix[14] = val
    this.#updatedCallback()
  }

  get items() { return this.#items }
  get x() { return this.matrix[12] }
  get y() { return this.matrix[13] }
  get z() { return this.matrix[14] }
}
