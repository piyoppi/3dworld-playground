import { VectorArray3 } from "../../../../lib/Matrix"
import { MoveProcess } from "./MoveProcess"
import { EndProcess } from "./EndProcess"
import { HaconiwaWorldItem } from "../../World/HaconiwaWorldItem"
import { RenderingObject } from "../../../../lib/RenderingObject"
import { Marker } from "../../../../lib/markers/Marker"
import { Camera } from "../../../../lib/Camera"
import { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder"
import { ColiderItemResolver } from "../../../../lib/ColiderItemResolver"
import { Coordinate } from "../../../../lib/Coordinate"
import { MouseButton, WindowCursor } from "../../../../lib/mouse/MouseControllable"
import { ReadOnlyRaycaster } from "../../../../lib/ReadOnlyRaycaster"
import { CoordinatedColider } from "../../../../lib/Colider"

export type StartParmas<T extends RenderingObject> = {
  position: VectorArray3,
  register: (item: HaconiwaWorldItem, renderingObject: RenderingObject) => Coordinate,
  registerMarker: (marker: Marker) => void,
  select: () => void,
  getCamera: () => Camera,
  getRenderingObjectBuilder: () => RenderingObjectBuilder<T>,
  getColiderItemResolver: () => ColiderItemResolver<T>,
  addRenderingObject: (coordinate: Coordinate, renderingObject: T) => void,
  removeRenderingObject: (coordinate: Coordinate) => void,
  getMarkerRaycaster: () => ReadOnlyRaycaster<CoordinatedColider>,
  cursor: WindowCursor,
  button: MouseButton,
}

export interface StartProcess<T extends RenderingObject> {
  start(params: StartParmas<T>): MoveProcess | EndProcess 
}
