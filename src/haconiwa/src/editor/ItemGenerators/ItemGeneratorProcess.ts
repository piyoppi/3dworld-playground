import type { VectorArray3 } from "../../../../lib/Matrix"
import type { HaconiwaWorldItem } from "../../World/HaconiwaWorldItem"
import type { RenderingObject } from "../../../../lib/RenderingObject"
import type { Marker } from "../../../../lib/markers/Marker"
import type { Camera } from "../../../../lib/Camera"
import type { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder"
import type { Coordinate } from "../../../../lib/Coordinate"
import type { MouseButton, WindowCursor } from "../../../../lib/mouse/MouseControllable"
import type { ReadOnlyRaycaster } from "../../../../lib/ReadOnlyRaycaster"
import type { Colider, CoordinatedColider } from "../../../../lib/Colider"
import type { HandlingProcess } from "./HandlingProcess"

export type ItemGeneratorProcessPhase = "start" | "move" | "end"

export type ItemGeneratorParams<T extends RenderingObject> = {
  phase: ItemGeneratorProcessPhase,
  getPosition: () => VectorArray3,
  register: (item: HaconiwaWorldItem, renderingObject: T) => Coordinate,
  registerMarker: (marker: Marker) => void,
  removeMarker: (marker: Marker) => void,
  select: (coliders: Colider[], unselect: () => void) => void,
  getCamera: () => Camera,
  getRenderingObjectBuilder: () => RenderingObjectBuilder<T>,
  addRenderingObject: (coordinate: Coordinate, renderingObject: T) => void,
  removeRenderingObject: (coordinate: Coordinate) => void,
  getMarkerRaycaster: () => ReadOnlyRaycaster<CoordinatedColider>,
  cursor: WindowCursor,
  button: MouseButton,
}

export interface ItemGeneratorProcess<T extends RenderingObject> {
  process(params: ItemGeneratorParams<T>): HandlingProcess
}
