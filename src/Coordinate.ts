import { Item } from './Item.js'
import { Mat4, MatrixArray4, VectorArray3 } from './Matrix.js'
import { v4 as uuidv4 } from 'uuid'

export class Coordinate {
  #items: Array<Item>
  #parent: Coordinate | null
  #children: Array<Coordinate>
  #matrix:  MatrixArray4
  #updatedCallback: () => void
  #uuid: string

  constructor() {
    this.#parent = null
    this.#uuid = uuidv4()
    this.#children = []
    this.#items = []
    this.#matrix = Mat4.getIdentityMatrix()
    this.#updatedCallback = () => {}
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
    return this.#parent
  }

  set parent(value: Coordinate | null) {
    this.#parent = value
  }

  get children() {
    return this.#children
  }

  getTransformMatrixToWorld(mat: MatrixArray4 = Mat4.getIdentityMatrix()) {
    let transform = Mat4.mul(this.matrix, mat)

    if (this.#parent) {
      transform = this.#parent.getTransformMatrixToWorld(transform)
    }

    return transform
  }

  getTransformMatrixFromWorldToCoordinate(mat: MatrixArray4 = Mat4.getIdentityMatrix()) {
    let transform = Mat4.mul(mat, Mat4.inverse(this.matrix))

    if (this.#parent) {
      transform = this.#parent.getTransformMatrixFromWorldToCoordinate(transform)
    }

    return transform
  }

  getGlobalPosition(position: VectorArray3 = [0, 0, 0]): VectorArray3 {
    return Mat4.mulGlVec3(this.getTransformMatrixToWorld(), position)
  }

  setUpdateCallback(func: () => void) {
    this.#updatedCallback = func
  }

  addItem(item: Item) {
    if (this.#items.find(has => has.uuid === item.uuid)) return

    this.#items.push(item)
    if (!item.parentCoordinate || item.parentCoordinate.uuid !== this.uuid) {
      item.parentCoordinate = this
    }
  }

  addChild(child: Coordinate) {
    this.#children.push(child)
    child.parent = this
  }

  static create(items: Array<Item>): Coordinate {
    const coordinate = new Coordinate()

    items.forEach(item => coordinate.addItem(item))

    return coordinate
  }

  lookAt(targetPoint: VectorArray3) {
    this.matrix = Mat4.lookAt(targetPoint, this.position)  
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
