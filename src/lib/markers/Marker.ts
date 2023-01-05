import type { Coordinate } from "../Coordinate"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { Raycaster } from "../Raycaster"
import type { Colider } from "../Colider"

export interface Marker {
  readonly coliders: Colider[]
  attach: (raycaster: Raycaster, mouseHandlers: MouseControlHandles) => void
  detach: (raycaster: Raycaster, mouseHandlers: MouseControlHandles) => void
  setParentCoordinate: (coordinate: Coordinate) => void
}

export interface MarkerRenderable {
  readonly markerCoordinates: Coordinate[]
}
