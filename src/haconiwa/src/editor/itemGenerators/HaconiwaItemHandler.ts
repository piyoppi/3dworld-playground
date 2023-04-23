import { Marker } from "../../../../lib/markers/Marker"
import { HaconiwaWorldItem } from "../../World/HaconiwaWorldItem.js"

export interface HaconiwaItemHandler {
  createItemWithHandler: () => {item: HaconiwaWorldItem, markers: Marker[]}
  dispose: () => void
  select: () => void
  unselect: () => void
}
