import { Marker } from "../../../../lib/markers/Marker"
import { VectorArray3 } from "../../../../lib/Matrix"
import { RenderingObject } from "../../../../lib/RenderingObject"
import { HaconiwaWorldItem } from "../../World/HaconiwaWorldItem"
import { EndProcess } from "./EndProcess"

export type MoveParams = {
  position: VectorArray3,
  register: (item: HaconiwaWorldItem, renderingObject: RenderingObject) => void,
  registerMarker: (marker: Marker) => void
}

export interface MoveProcess {
  move(params: MoveParams): EndProcess | null
}
