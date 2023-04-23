import { VectorArray3 } from "../../../../lib/Matrix"
import { HaconiwaWorldItem } from "../../World/HaconiwaWorldItem.js"
import { RenderingObject } from "../../../../lib/RenderingObject"
import { Marker } from "../../../../lib/markers/Marker"

export type EndParams = {
  register: (item: HaconiwaWorldItem, renderingObject: RenderingObject) => void
}

export type StartParmas = {
  position: VectorArray3,
  register: (item: HaconiwaWorldItem, renderingObject: RenderingObject) => void,
  registerMarker: (marker: Marker) => void
}

export type MoveParams = {
  position: VectorArray3
}

export interface HaconiwaItemGeneratorProcess {
  start(params: StartParmas): void
  move(position: VectorArray3): void
  end(params: EndParams): void
}
