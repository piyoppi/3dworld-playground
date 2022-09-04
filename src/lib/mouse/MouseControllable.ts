import { Coordinate } from "../Coordinate"

export type MouseButton = 'primary' | 'secondary' | 'wheel' | 'none'

export type MouseControllableCallbackFunction = () => void

export interface MouseControllable {
  setStartedCallback: (func: MouseControllableCallbackFunction) => void
  removeStartedCallback: (func: MouseControllableCallbackFunction) => void
  start: (cursorX: number, cursorY: number, button: MouseButton, cameraCoordinate: Coordinate) => boolean | void
  move: (cursorX: number, cursorY: number, button: MouseButton, cameraCoordinate: Coordinate) => void
  end: () => void
  wheel?: (delta: number) => void
  readonly isStart: boolean
}
