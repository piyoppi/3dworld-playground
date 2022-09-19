import type { Coordinate } from "../Coordinate"
import type { MouseControllable } from "../mouse/MouseControllable"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { Raycaster } from "../Raycaster"
import type { Colider } from "../Colider"

export interface Marker {
  readonly parentCoordinate: Coordinate
  readonly handlers: MouseControllable[]
  readonly colider: Colider | null
  setHandlers: (handlers: MouseControllable[]) => Colider
  attach: (raycaster: Raycaster, mouseHandlers: MouseControlHandles) => void
  detach: (raycaster: Raycaster, mouseHandlers: MouseControlHandles) => void
  setParentCoordinate: (coordinate: Coordinate) => void
}
