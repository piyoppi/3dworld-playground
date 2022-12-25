import { Eular } from "./Eular.js"
import { MatrixArray3, VectorArray3, VectorArray4 } from "./Matrix"

export class Quaternion {
  #w = 0
  #i = 0
  #j = 0
  #k = 0

  constructor(w: number, i: number, j: number, k: number) {
    this.#w = w
    this.#i = i
    this.#j = j
    this.#k = k
  }

  normalize() {
    return Quaternion.normalize(this)
  }

  toEular() {
    return Quaternion.toEular(this)
  }

  toMatrix() {
    return Quaternion.toMatrix(this)
  }

  static toMatrix(q: Quaternion): MatrixArray3 {
    return [
      1 - 2 * q.#j * q.#j - 2 * q.#k * q.#k,
      2 * q.#i * q.#j - 2 * q.#w * q.#k,
      2 * q.#i * q.#k + 2 * q.#w * q.#j,
      2 * q.#i * q.#j + 2 * q.#w * q.#k,
      1 - 2 * q.#i * q.#i - 2 * q.#k * q.#k,
      2 * q.#j * q.#k - 2 * q.#w * q.#i,
      2 * q.#i * q.#k - 2 * q.#w * q.#j,
      2 * q.#j * q.#k + 2 * q.#w * q.#i,
      1 - 2 * q.#i * q.#i - 2 * q.#j * q.#j
    ]
  }

  static toEular(q: Quaternion) {
    return new Eular(
      Math.asin(-2.0 * (q.#j * q.#k + q.#w * q.#i)),
      Math.atan2(q.#i * q.#k - q.#w * q.#j, 0.5 - q.#i * q.#i - q.#j * q.#j),
      Math.atan2(q.#i * q.#j - q.#w * q.#k, 0.5 - q.#i * q.#i - q.#k * q.#k)
    )
  }

  static fromRotateParams(angle: number, direction: VectorArray3) {
    return new Quaternion(
      Math.cos(angle / 2),
      Math.sin(angle / 2) * direction[0] ,
      Math.sin(angle / 2) * direction[1] ,
      Math.sin(angle / 2) * direction[2] 
    ).normalize()
  }

  static mul(q1: Quaternion, q2: Quaternion) {
    return new Quaternion(
      q1.#w * q2.#w - q1.#i * q2.#i - q1.#j * q2.#j - q1.#k * q2.#k,
      q1.#w * q2.#i + q1.#i * q2.#w - q1.#j * q2.#k + q1.#k * q2.#j,
      q1.#w * q2.#j + q1.#j * q2.#w - q1.#k * q2.#i + q1.#i * q2.#k,
      q1.#w * q2.#k + q1.#k * q2.#w - q1.#i * q2.#j + q1.#j * q2.#i
    )
  }

  static norm(q: Quaternion) {
    return Math.sqrt(q.#w * q.#w + q.#i * q.#i + q.#j * q.#j + q.#k * q.#k)
  }

  static normalize(q: Quaternion) {
    const norm = Quaternion.norm(q)

    return new Quaternion(
      q.#w / norm,
      q.#i / norm,
      q.#j / norm,
      q.#k / norm,
    )
  }
}
