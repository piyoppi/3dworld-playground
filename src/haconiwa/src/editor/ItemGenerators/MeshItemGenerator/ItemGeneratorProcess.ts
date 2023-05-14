import type { ItemGeneratorProcess as IItemGeneratorProcess, ItemGeneratorParams } from "../ItemGeneratorProcess"
import type { RenderingObject } from "../../../../../lib/RenderingObject"
import type { HandlingProcess as IHandlingProcess } from "../HandlingProcess"
import { Item } from "../../../../../lib/Item.js"
import { HaconiwaWorldItem } from "../../../World/HaconiwaWorldItem.js"
import { BoxMarker } from "../../../../../lib/markers/BoxMarker.js"
import { ProxyHandler } from "../../../../../lib/mouse/handlers/ProxyHandler.js"
import { makeCoordinateMover } from "../../../../../lib/markers/generators/CoordinateMover.js"
import { HandlingProcess } from "./HandlingProcess.js"
import { NoneHandler } from "../../../../../lib/mouse/handlers/NoneHandler.js"

export class ItemGeneratorProcess<T extends RenderingObject> implements IItemGeneratorProcess<T> {
  constructor(
    private original: T
  ) { }

  process({
    register,
    registerMarker,
    select,
    getCamera,
    getMarkerRaycaster,
  }: ItemGeneratorParams<T>): IHandlingProcess {
    const handlingProcess = new HandlingProcess()

    const renderingObject = this.original.clone() as T
    const item = new Item()
    register(new HaconiwaWorldItem(item, [], []), renderingObject)

    const itemMarker = new BoxMarker(renderingObject.size, item.parentCoordinate)

    const raycaster = getMarkerRaycaster()
    const proxyHandler = new ProxyHandler(raycaster, itemMarker.coliders)
    const handler = () => {
      proxyHandler.removeStartedCallback(handler)
      const markers = makeCoordinateMover(raycaster, item.parentCoordinate, getCamera())
      const markerRemovers = markers.map(marker => registerMarker(marker))
      renderingObject.material.setOpacity(0.6)

      const boundaryMarker = new BoxMarker([5, 5, 5], item.parentCoordinate)
      boundaryMarker.addHandler(new NoneHandler())
      const boundaryMarkerRemover = registerMarker(boundaryMarker, {render: false})

      select(boundaryMarker.coliders, handlingProcess, () => {
        boundaryMarkerRemover()
        markerRemovers.forEach(remove => remove())
        renderingObject.material.setOpacity(1)
        proxyHandler.setStartedCallback(handler)
      })

      select(itemMarker.coliders, handlingProcess, () => {})
    }

    proxyHandler.setStartedCallback(handler)

    itemMarker.addHandler(proxyHandler)
    registerMarker(itemMarker, {render: false})

    return handlingProcess
  }
}
