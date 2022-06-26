import { Item } from './Item.js'
import { Mat4, MatrixArray4, VectorArray3 } from './Matrix.js'
import { v4 as uuidv4 } from 'uuid'

export class Coordinate {
  #items: Array<Item>
  #parent: Coordinate | null
  #children: Array<Coordinate>
  #position: VectorArray3
  #rotation: VectorArray3
  #matrix:  MatrixArray4
  #updatedCallback: () => void
  #uuid: string

  constructor() {
    this.#parent = null
    this.#uuid = uuidv4()
    this.#children = []
    this.#items = []
    this.#position = [0, 0, 0]
    this.#rotation = [0, 0, 0]
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

  setUpdateCallback(func: () => void) {
    this.#updatedCallback = func
  }

  addItem(item: Item) {
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
    this.matrix = Mat4.lookAt(targetPoint, this.#position)  
  }

  position() {
    return this.#position
  }

  set x(val) {
    this.#position[0] = val 
    this.matrix[12] = val
    this.#updatedCallback()
  }
  set y(val) {
    this.#position[1] = val 
    this.matrix[13] = val
    this.#updatedCallback()
  }
  set z(val) {
    this.#position[2] = val 
    this.matrix[14] = val
    this.#updatedCallback()
  }

  get items() { return this.#items }
  get x() { return this.#position[0] }
  get y() { return this.#position[1] }
  get z() { return this.#position[2] }
}
