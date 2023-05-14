import type { ItemGeneratorProcess as IItemGeneratorProcess, ItemGeneratorParams } from "../ItemGeneratorProcess"
import type { RenderingObject } from "../../../../../lib/RenderingObject"
import type { HandlingProcess as IHandlingProcess } from "../HandlingProcess"
import { Item } from "../../../../../lib/Item.js"
import { HaconiwaWorldItem } from "../../../World/HaconiwaWorldItem.js"
import { BoxMarker } from "../../../../../lib/markers/BoxMarker.js"
import { ProxyHandler } from "../../../../../lib/mouse/handlers/ProxyHandler.js"
import { makeCoordinateMover } from "../../../../../lib/markers/generators/CoordinateMover.js"
import { HandlingProcess } from "./HandlingProcess.js"

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
    const camera = getCamera()
    const handlingProcess = new HandlingProcess()

    const renderingObject = this.original.clone() as T
    renderingObject.material.setOpacity(0.4)
    const item = new Item()
    register(new HaconiwaWorldItem(item, [], []), renderingObject)

    const itemMarker = new BoxMarker(renderingObject.size, item.parentCoordinate)
    const raycaster = getMarkerRaycaster()
    const proxyHandler = new ProxyHandler(raycaster, itemMarker.coliders)
    itemMarker.addHandler(proxyHandler)
    registerMarker(itemMarker)

    proxyHandler.setStartedCallback(() => {
      itemMarker.coliders.forEach(colider => colider.enabled = false)

      const markers = makeCoordinateMover(raycaster, item.parentCoordinate, camera)
      const markerRemovers = markers.map(marker => registerMarker(marker))

      select(itemMarker.coliders, handlingProcess, () => {
        markerRemovers.forEach(remove => remove())
        itemMarker.coliders.forEach(colider => colider.enabled = true)
      })
    })

    return handlingProcess
  }
}
