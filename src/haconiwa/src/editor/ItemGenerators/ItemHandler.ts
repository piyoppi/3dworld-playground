import { CoordinatedColider } from "../../../../lib/Colider"
import { MouseControlHandles } from "../../../../lib/mouse/MouseControlHandles"
import { Raycaster } from "../../../../lib/Raycaster"
import { Renderer } from "../../../../lib/Renderer"
import { HandlingProcess } from "./HandlingProcess"
import { ItemGenerateState } from "./ItemGenerateHandler/ItemGenerateState"

export class ItemHandler {
  constructor(
    private state: ItemGenerateState,
    private handlingProcess: HandlingProcess,
  ) {
  }

  get items() {
    return this.state.getItems()
  }

  dispose<T>(renderer: Renderer<T>, raycaster: Raycaster<CoordinatedColider>, mouseHandler: MouseControlHandles) {
    this.state.getMarkers().forEach(marker => {
      marker.detach(raycaster, mouseHandler)
    })

    this.state.getRenderingObjectCoordinates().forEach(coordinate => {
      renderer.removeItem(coordinate)
    })

    this.handlingProcess.dispose()
  }
}
