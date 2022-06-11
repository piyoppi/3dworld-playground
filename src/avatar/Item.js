import { updateFromMatrix } from './ThreeMatrixHelper.js'

export class Item {
  #renderingObject
  #parentCoordinate

  constructor() {
    this.#renderingObject = null
  }

  set renderingObject(renderingObj) {
    this.#renderingObject = renderingObj
  }

  get renderingObject() {
    return this.#renderingObject
  }

  set parentCoordinate(value) {
    this.#parentCoordinate = value
  }

  get parentCoordinate() {
    return this.#parentCoordinate
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
  setChild(coordinate) {}
}

import * as THREE from 'three'

export class ThreeCoordinate extends Coordinate {
  #threeObject
  #items
  #parent
  #children

  constructor() {
    super()
    this.#children = []
    this.#items = []
    this.#threeObject = new THREE.Object3D()
  }

  get matrix() {
    return this.#threeObject.matrix.toArray()
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

  get raw() {
    return this.#threeObject
  }

  addItem(item) {
    if (this.#items.length === 0 && item.renderingObject.raw) {
      this.#threeObject = item.renderingObject.raw
    } else {
      this.#threeObject.add(item.renderingObject.raw)
    }

    item.parentCoordinate = this
    this.#items.push(item)
  }

  setChild(coordinate) {
    this.#threeObject.add(coordinate.raw)
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

  get items() { return this.#items }
  get x() { return this.#threeObject.position.x }
  get y() { return this.#threeObject.position.y }
  get z() { return this.#threeObject.position.z }
  get rx() { return this.#threeObject.rotatation.x }
  get ry() { return this.#threeObject.rotatation.y }
  get rz() { return this.#threeObject.rotatation.z }
  get scale() { return this.#threeObject.scale }
}

export const flatChildItem = (coordinate) => {
  return [
    ...coordinate.items,
    ...coordinate.children.map(childCoordinate => flatChildItem(childCoordinate)).flat()
  ]
}

