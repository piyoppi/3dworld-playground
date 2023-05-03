import type { Coordinate } from "../Coordinate"

export type MouseButton = 'primary' | 'secondary' | 'wheel' | 'none'

export type MouseControllableCallbackFunction = () => void

export type WindowCursor = {
  screenX: number,
  screenY: number,
  normalizedX: number,
  normalizedY: number
}

export interface MouseControllable {
  setStartedCallback: (func: MouseControllableCallbackFunction) => void
  removeStartedCallback: (func: MouseControllableCallbackFunction) => void
  start: (cursor: WindowCursor, button: MouseButton, cameraCoordinate: Coordinate) => boolean | void
  move: (cursor: WindowCursor, button: MouseButton, cameraCoordinate: Coordinate) => void
  end: (cursor: WindowCursor, button: MouseButton, cameraCoordinate: Coordinate) => void
  wheel?: (delta: number) => void
  readonly isStart: boolean
}
