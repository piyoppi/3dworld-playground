import type { Coordinate } from "../Coordinate"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { Raycaster } from "../Raycaster"
import type { CoordinatedColider } from "../Colider"
import { MouseControllable } from "../mouse/MouseControllable"

export interface Marker {
  readonly coliders: CoordinatedColider[]
  readonly handlers: MouseControllable[]
  attach: (raycaster: Raycaster<CoordinatedColider>, mouseHandlers: MouseControlHandles) => void
  detach: (raycaster: Raycaster<CoordinatedColider>, mouseHandlers: MouseControlHandles) => void
}

export interface SingleMarker extends Marker {
  addHandler: (handler: MouseControllable) => void
}

export interface MarkerRenderable {
  readonly markerCoordinates: Coordinate[]
}
