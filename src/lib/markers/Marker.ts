import type { Coordinate } from "../Coordinate";
import type { MouseControllable } from "../mouse/MouseControllable";
import type { MouseHandlers } from "../mouse/MouseHandlers";
import type { Raycaster } from "../Raycaster";

export interface Marker {
  setHandle: (raycaster: Raycaster, mouseHandlers: MouseHandlers, handler: MouseControllable) => void
  removeHandle: (raycaster: Raycaster, mouseHandlers: MouseHandlers) => void
  setParentCoordinate: (coordinate: Coordinate) => void
}
