import { CoordinatedColider } from "../../../../lib/Colider"
import { Coordinate } from "../../../../lib/Coordinate"
import { Marker } from "../../../../lib/markers/Marker"
import { MouseControlHandles } from "../../../../lib/mouse/MouseControlHandles"
import { Raycaster } from "../../../../lib/Raycaster"
import { Renderer } from "../../../../lib/Renderer"
import { HaconiwaWorldItem } from "../../World/HaconiwaWorldItem"
import { HandlingProcess } from "./HandlingProcess"

export class ItemHandler {
  constructor(
    private markers: Marker[],
    private renderingCoordinates: Coordinate[],
    private items: HaconiwaWorldItem[],
    private handlingProcess: HandlingProcess,
  ) {
  }

  dispose<T>(renderer: Renderer<T>, raycaster: Raycaster<CoordinatedColider>, mouseHandler: MouseControlHandles) {
    this.markers.forEach(marker => {
      marker.detach(raycaster, mouseHandler)
    })

    this.renderingCoordinates.forEach(coordinate => {
      renderer.removeItem(coordinate)
    })

    this.handlingProcess.dispose()
  }
}
