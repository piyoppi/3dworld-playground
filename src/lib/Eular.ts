import { MatrixArray3, VectorArray3 } from "./Matrix"

export class Eular {
  #heading = 0
  #pitch = 0
  #bank = 0

  constructor(heading: number, pitch: number, bank: number) {
    this.#heading = heading
    this.#pitch = pitch
    this.#bank = bank
  }

  get heading() {
    return this.#heading
  }

  get pitch() {
    return this.#pitch
  }

  get bank() {
    return this.#bank
  }

  toVectorArray3(): VectorArray3 {
    return [this.#heading, this.#pitch, this.#bank]
  }

  toVectorArray3XYZ(): VectorArray3 {
    return [this.#pitch, this.#heading, this.#bank]
  }

  static fromMatrix(mat: MatrixArray3) {
    const sinp = mat[5]
    const locked = sinp > 0.99
    const p = Math.asin(sinp)
    const b = locked ? 0 : Math.atan2(mat[2], mat[8])
    const h = locked ? Math.atan2(-mat[7], mat[0]) : Math.atan2(mat[3], mat[4])

    //const sinp = mat[7]
    //const locked = sinp > 0.99
    //const p = Math.asin(sinp)
    //const b = locked ? 0 : Math.atan2(mat[6], mat[8])
    //const h = locked ? Math.atan2(-mat[5], mat[0]) : Math.atan2(mat[1], mat[4])

    return new Eular(h, p, b)
  }
}
