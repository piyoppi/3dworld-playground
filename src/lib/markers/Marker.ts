import type { Coordinate } from "../Coordinate";
import type { MouseControllable } from "../mouse/MouseControllable";
import type { ControlHandle, MouseHandlers } from "../mouse/MouseHandlers";
import type { Raycaster } from "../Raycaster";

export interface Marker {
  readonly parentCoordinate: Coordinate
  readonly handler: MouseControllable | null
  setHandler: (handler: MouseControllable) => ControlHandle 
  attach: (raycaster: Raycaster, mouseHandlers: MouseHandlers) => void
  detach: (raycaster: Raycaster, mouseHandlers: MouseHandlers) => void
  setParentCoordinate: (coordinate: Coordinate) => void
}
