import { LineItem, LineItemConnection } from "../../../../lib/LineItem.js"
import type { Raycaster } from "../../../../lib/Raycaster"
import type { Renderer } from "../../../../lib/Renderer"
import { LineSegmentGenerator } from '../../../../lib/itemGenerators/lineItemGenerator/lineGenerator/LineSegmentGenerator.js'
import type { Clonable } from "../../clonable"
import type {
  HaconiwaItemGenerator,
  HaconiwaItemGeneratorFactory,
  HaconiwaItemGeneratorClonedItem,
  HaconiwaItemGeneratedCallback,
  HaconiwaItemGeneratorLineConnectable,
  HaconiwaItemGeneratorItemClonable
} from "./HaconiwaItemGenerator"
import { Coordinate } from "../../../../lib/Coordinate.js"
import { HaconiwaWorldItem } from "../../world.js"
import { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder.js"
import { MouseButton, MouseControllableCallbackFunction } from "../../../../lib/mouse/MouseControllable.js"
import { CallbackFunctions } from "../../../../lib/CallbackFunctions.js"
import { ColiderItemMap } from "../../../../lib/ColiderItemMap.js"
import { makeConnectionMarker } from './MakeConnectionMarker.js'
import { Vec3 } from "../../../../lib/Matrix.js"
import { Group, Mesh, Scene } from "three"
import { RenderingObject } from "../../../../lib/RenderingObject.js"

export class RouteItemGenerator<T extends RenderingObject<T>>
  implements HaconiwaItemGenerator<T>, HaconiwaItemGeneratorLineConnectable, HaconiwaItemGeneratorItemClonable<T> {
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback<T>> = []
  #planeRaycaster: Raycaster
  #markerRaycaster: Raycaster
  #renderingObjectBuilder: RenderingObjectBuilder<T>
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #endedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #isStarted = false
  #renderer
  #coliderConnectionMap: ColiderItemMap<LineItemConnection> | null = null
  private original: HaconiwaItemGeneratorClonedItem<T> | null = null

  constructor(renderer: Renderer<T>, planeRaycaster: Raycaster, markerRaycaster: Raycaster, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    this.#planeRaycaster = planeRaycaster
    this.#markerRaycaster = markerRaycaster
    this.#renderingObjectBuilder = renderingObjectBuilder
    this.#renderer = renderer
  }

  get isStart() {
    return this.#isStarted
  }

  setOriginal(original: HaconiwaItemGeneratorClonedItem<T>) {
    this.original = original
  }

  setConnectorColiderMap(coliderConnectionMap: ColiderItemMap<LineItemConnection>) {
    this.#coliderConnectionMap = coliderConnectionMap
  }

  setStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.add(func)
  }

  removeStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.remove(func)
  }

  registerOnGeneratedCallback(func: HaconiwaItemGeneratedCallback<T>) {
    this.#onGeneratedCallbacks.push(func)
  }

  start(x: number, y: number, button: MouseButton, cameraCoordinate: Coordinate) {
    if (!this.#planeRaycaster.hasColided || this.#isStarted) return

    this.#isStarted = true

    const lineGenerator = new LineSegmentGenerator()
    const startPosition = this.#markerRaycaster.colidedDetails[0]?.colider.parentCoordinate?.position || this.#planeRaycaster.colidedDetails[0].position
    const endPosition = this.#planeRaycaster.colidedDetails[0].position
    lineGenerator.setStartPosition(startPosition)
    lineGenerator.setEndPosition(endPosition)

    const line = lineGenerator.getLine()
    const item = new LineItem(line)
    item.parentCoordinate.lookAt(startPosition)

    const markers = makeConnectionMarker(item, this.#renderer, this.#renderingObjectBuilder, this.#markerRaycaster, this.#planeRaycaster, this.#coliderConnectionMap)
    markers.forEach((marker, index) => {
      marker.parentCoordinate.setUpdateCallback(() => {
        item.line.setEdge(index, marker.parentCoordinate.position)
        this.updateRenderingObject(item)
      })
    })

    const renderingObject = this.makeRenderingObject().then(renderingObject => {
      this.#renderer.addItem(item.parentCoordinate, renderingObject)

      this.#onGeneratedCallbacks.forEach(func => func([new HaconiwaWorldItem(item, [], markers)]))

      this.#startedCallbacks.call()

      markers[1]?.handlers.forEach(handler => handler.start(x, y, button, cameraCoordinate))
    })

    return true
  }

  move() {
    // noop
  }

  end() {
    this.#isStarted = false
    this.#endedCallbacks.call()
  }

  private async makeRenderingObject() {
    if (!this.original) throw new Error('Item and RenderingObject is not set.')

    return this.original.renderingObject.clone()
  }

  private updateRenderingObject(lineItem: LineItem) {
    const itemScale = lineItem.line.length / (this.original?.renderingObject.size[0] || 1)
    lineItem.parentCoordinate.scale([1, 1, itemScale])

    const renderingItem = this.#renderer.renderingObjectFromCoordinate(lineItem.parentCoordinate)

    if (renderingItem) {
      renderingItem.material.repeat(itemScale, 1)
    }

    const direction = lineItem.line.getDirection(0)
    const position = Vec3.add(lineItem.connections[0].edge.position, Vec3.mulScale(Vec3.subtract(lineItem.connections[1].edge.position, lineItem.connections[0].edge.position), 0.5))
    lineItem.parentCoordinate.setDirectionZAxis(direction, position)

    if (Vec3.dotprod(lineItem.parentCoordinate.zAxis, [0, 1, 0]) < 0) {
      lineItem.parentCoordinate.rotateX(Math.PI)
    }
  }
}

export class RouteItemGeneratorFactory<T extends RenderingObject<T>> implements HaconiwaItemGeneratorFactory<T> {
  create(renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    const generator = new RouteItemGenerator(renderer, raycaster, markerRaycaster, renderingObjectBuilder)

    return generator
  }
}
