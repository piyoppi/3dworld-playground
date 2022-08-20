import { Coordinate } from "../Coordinate"

export type MouseButton = 'primary' | 'secondary' | 'wheel' | 'none'

export interface MouseControllable {
  start: (cursorX: number, cursorY: number, button: MouseButton, cameraCoordinate: Coordinate) => void
  move: (cursorX: number, cursorY: number, button: MouseButton, cameraCoordinate: Coordinate) => void
  end: () => void
  wheel?: (delta: number) => void
  readonly isStart: boolean
}
