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
}
