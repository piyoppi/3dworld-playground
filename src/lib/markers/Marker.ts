import type { Coordinate } from "../Coordinate"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { Raycaster } from "../Raycaster"
import type { Colider } from "../Colider"
import { MouseControllable } from "../mouse/MouseControllable"

export interface Marker {
  readonly coliders: Colider[]
  attach: (raycaster: Raycaster, mouseHandlers: MouseControlHandles) => void
  detach: (raycaster: Raycaster, mouseHandlers: MouseControlHandles) => void
  setParentCoordinate: (coordinate: Coordinate) => void
}

export interface SingleMarker extends Marker {
  addHandler: (handler: MouseControllable) => void
}

export interface MarkerRenderable {
  readonly markerCoordinates: Coordinate[]
}
