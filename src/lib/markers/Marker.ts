import type { Coordinate } from "../Coordinate"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { Raycaster } from "../Raycaster"
import type { CoordinatedColider } from "../Colider"
import type { RenderingObjectBuilder } from "../RenderingObjectBuilder"
import type { MouseControllable } from "../mouse/MouseControllable"
import type { RenderingObject } from "../RenderingObject"
import { Renderer } from "../Renderer"

type DetachRenderingObjectHandler = () => void

export interface Marker {
  readonly coliders: CoordinatedColider[]
  readonly handlers: MouseControllable[]
  attach: (raycaster: Raycaster<CoordinatedColider>, mouseHandlers: MouseControlHandles) => void
  detach: (raycaster: Raycaster<CoordinatedColider>, mouseHandlers: MouseControlHandles) => void
  attachRenderingObjects?: <T extends RenderingObject>(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) => DetachRenderingObjectHandler
  readonly parentCoordinate: Coordinate
}

export interface SingleMarker extends Marker {
  addHandler: (handler: MouseControllable) => void
}

export interface MarkerRenderable {
  readonly markerCoordinates: Coordinate[]
}
