export interface MouseDraggable {
  start: (cursorX: number, cursorY: number) => void
  move: (cursorX: number, cursorY: number) => void
  end: () => void
}

export class MouseDragHandler {
  #initialMousePosition
  #isStart: boolean

  constructor() {
    this.#initialMousePosition = [0, 0]
    this.#isStart = false
  }

  get isStart() {
    return this.#isStart
  }

  start(cursorX: number, cursorY: number) {
    if (this.#isStart) return

    this.#initialMousePosition[0] = cursorX
    this.#initialMousePosition[1] = cursorY

    this.#isStart = true
  }

  move(cursorX: number, cursorY: number) {
    if (!this.#isStart) return [0, 0]

    const dx = (this.#initialMousePosition[0] - cursorX) * 0.01
    const dy = (this.#initialMousePosition[1] - cursorY) * 0.01

    this.#initialMousePosition[0] = cursorX
    this.#initialMousePosition[1] = cursorY

    return [dx, dy]
  }

  end() {
    this.#initialMousePosition[0] = 0
    this.#initialMousePosition[1] = 0
    this.#isStart = false
  }
}
