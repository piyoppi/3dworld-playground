import { Marker } from "../../../../lib/markers/Marker"
import { HaconiwaWorldItem } from "../../World/HaconiwaWorldItem.js"
import { VectorArray3 } from "../../../../lib/Matrix"
import { RenderingObject } from "../../../../lib/RenderingObject"

export type CreateItemWithHandlerParams = {
  position: VectorArray3,
  register: (item: HaconiwaWorldItem, renderingObject: RenderingObject) => void
}

export interface HaconiwaItemHandler {
  createItemWithHandler: (params: CreateItemWithHandlerParams) => {item: HaconiwaWorldItem, markers: Marker[]}
  dispose: () => void
  select: () => void
  unselect: () => void
}
