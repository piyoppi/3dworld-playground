import type { Coordinate } from "../Coordinate";
import type { MouseControllable } from "../mouse/MouseControllable";
import type { MouseHandlers } from "../mouse/MouseHandlers";
import type { Raycaster } from "../Raycaster";

export interface Marker {
  readonly parentCoordinate: Coordinate
  setHandler: (handler: MouseControllable) => void
  attach: (raycaster: Raycaster, mouseHandlers: MouseHandlers) => void
  detach: (raycaster: Raycaster, mouseHandlers: MouseHandlers) => void
  setParentCoordinate: (coordinate: Coordinate) => void
}
