import { updateFromMatrix } from './ThreeMatrixHelper.js'

export class Item {
  #renderingObject
  #coordinate

  constructor() {
    this.#renderingObject = null
  }

  get coordinate() {
    return this.#coordinate
  }

  set renderingObject(renderingObj) {
    this.#renderingObject = renderingObj

    this.#coordinate = new ThreeCoordinate(this.#renderingObject.raw)
  }

  get renderingObject() {
    return this.#renderingObject
  }
}

export class Coordinate {
  set x(val) {}
  set y(val) {}
  set z(val) {}
  set rx(val) {}
  set ry(val) {}
  set rz(val) {}
  set scale(val) {}
  get x() {}
  get y() {}
  get z() {}
  get rx() {}
  get ry() {}
  get rz() {}
  get scale() {}
  get matrix() {}
  get parent() {}
  setParent(coordinate) {}
}

export class ThreeCoordinate extends Coordinate {
  #threeObject
  #parent
  #children

  constructor(threeObject) {
    super()
    this.#children = []
    this.#threeObject = threeObject
  }

  get matrix() {
    return this.#threeObject.matrix
  }

  set matrix(array) {
    updateFromMatrix(this.#threeObject, array)
  }

  get parent() {
    return this.#parent
  }

  get children() {
    return this.#children
  }

  get threeObject() {
    return this.#threeObject
  }

  setChild(coordinate) {
    this.#threeObject.add(coordinate.threeObject)
    coordinate.setParent(this)
    this.#children.push(coordinate)
  }

  setParent(coordinate) {
    this.#parent = coordinate
  }

  set x(val) { this.#threeObject.position.x = val }
  set y(val) { this.#threeObject.position.y = val }
  set z(val) { this.#threeObject.position.z = val }
  set rx(val) { this.#threeObject.rotation.x = val }
  set ry(val) { this.#threeObject.rotation.y = val }
  set rz(val) { this.#threeObject.rotation.z = val }
  set scale(val) { this.#threeObject.scale = val }

  get x() { return this.#threeObject.position.x }
  get y() { return this.#threeObject.position.y }
  get z() { return this.#threeObject.position.z }
  get rx() { return this.#threeObject.rotatation.x }
  get ry() { return this.#threeObject.rotatation.y }
  get rz() { return this.#threeObject.rotatation.z }
  get scale() { return this.#threeObject.scale }
}
