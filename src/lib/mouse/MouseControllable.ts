export interface MouseControllable {
  start: (cursorX: number, cursorY: number) => void
  move: (cursorX: number, cursorY: number) => void
  end: () => void
  wheel?: (delta: number) => void
  readonly isStart: boolean
}
