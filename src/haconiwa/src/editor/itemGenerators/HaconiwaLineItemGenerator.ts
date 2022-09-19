import { LineItem, LineItemConnection } from "../../../../lib/LineItem.js"
import type { Raycaster } from "../../../../lib/Raycaster"
import type { Renderer } from "../../../../lib/Renderer"
import { LineRenderingItemGenerator } from '../../../../lib/itemGenerators/lineItemGenerator/LineRenderingItemGenerator.js'
import { LineSegmentGenerator } from '../../../../lib/itemGenerators/lineItemGenerator/lineGenerator/LineSegmentGenerator.js'
import type { Clonable } from "../../clonable"
import type { HaconiwaItemGenerator, HaconiwaItemGeneratorFactory, HaconiwaItemGeneratorClonedItem, HaconiwaItemGeneratedCallback, HaconiwaItemGeneratorLineConnectable } from "./HaconiwaItemGenerator"
import { Coordinate } from "../../../../lib/Coordinate.js"
import { HaconiwaWorldItem } from "../../world.js"
import { CenterMarker } from "../../../../lib/markers/CenterMarker.js"
import { PlaneMoveHandler } from "../../../../lib/mouse/handlers/PlaneMoveHandler.js"
import { LineItemGenerator } from "../../../../lib/itemGenerators/lineItemGenerator/LineItemGenerator.js"
import { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder.js"
import { MouseButton, MouseControllable, MouseControllableCallbackFunction } from "../../../../lib/mouse/MouseControllable.js"
import { CallbackFunctions } from "../../../../lib/CallbackFunctions.js"
import { CursorSnapColiderModifier } from "../../../../lib/mouse/handlers/cursorModifiers/CursorSnapColiderModifier.js"
import { ColiderItemMap } from "../../../../lib/ColiderItemMap.js"
import { JointHandler } from "../../../../lib/mouse/handlers/JointHandler.js"

export class HaconiwaLineItemGenerator<T extends Clonable<T>> implements HaconiwaItemGenerator<T>, HaconiwaItemGeneratorLineConnectable {
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback<T>> = []
  #raycaster: Raycaster
  #markerRaycaster: Raycaster
  #renderingObjectBuilder: RenderingObjectBuilder<T>
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #endedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  private original: HaconiwaItemGeneratorClonedItem<T> | null = null
  #isStarted = false
  #renderer
  #coliderConnectionMap: ColiderItemMap<LineItemConnection> | null = null

  constructor(renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    this.#raycaster = raycaster
    this.#markerRaycaster = markerRaycaster
    this.#renderingObjectBuilder = renderingObjectBuilder
    this.#renderer = renderer
  }

  get isStart() {
    return this.#isStarted
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

  setOriginal(original: HaconiwaItemGeneratorClonedItem<T>) {
    this.original = original
  }

  start(x: number, y: number, button: MouseButton, cameraCoordinate: Coordinate) {
    if (!this.#raycaster.hasColided || this.#isStarted) return
    this.#isStarted = true

    const itemGenerator = new LineRenderingItemGenerator(this.#renderer)
    const lineGenerator = new LineSegmentGenerator()
    const startPosition = this.#markerRaycaster.colidedDetails[0]?.colider.parentCoordinate?.position || this.#raycaster.colidedDetails[0].position
    lineGenerator.setStartPosition(startPosition)

    lineGenerator.setEndPosition(this.#raycaster.colidedDetails[0].position)

    const lineItemGenerator = new LineItemGenerator<Coordinate, T>(() => this.itemFactory(), 1)
    const line = lineGenerator.getLine()
    const item = new LineItem(line)
    const markers = item.connections.map((connection, index) => {
      const marker = new CenterMarker(0.5)
      const moveHandler = new PlaneMoveHandler(marker.parentCoordinate, this.#raycaster)
      const snapModifier = new CursorSnapColiderModifier(this.#markerRaycaster, [marker.colider])
      const handlers: MouseControllable[] = []

      if (this.#coliderConnectionMap) {
        const jointHandler = new JointHandler(connection, item.connections, this.#markerRaycaster, this.#coliderConnectionMap)

        jointHandler.setEndedCallback(() => {
          if (connection.connections.length > 0) {
            moveHandler.clearCursorModifier()
          }
        })

        handlers.push(jointHandler)
        this.#coliderConnectionMap.add(marker.colider, connection)
      }
      handlers.push(moveHandler)

      marker.setHandlers(handlers)

      moveHandler.setCursorModifier(snapModifier)
      marker.parentCoordinate.position = connection.edge.position
      marker.attachRenderingObject<T>({r: 255, g: 0, b: 0}, this.#renderingObjectBuilder, itemGenerator.renderer)
      marker.parentCoordinate.setUpdateCallback(() => {
        this.#isStarted = true
        line.setControlPoint(index, marker.parentCoordinate.position)
        const generated = lineItemGenerator.update(line)
        itemGenerator.update(generated, item.parentCoordinate)
      })

      return marker
    }) || []

    this.#onGeneratedCallbacks.forEach(func => func([new HaconiwaWorldItem(item, [], markers)]))

    this.#startedCallbacks.call()

    markers[1]?.handlers.forEach(handler => handler.start(x, y, button, cameraCoordinate))

    return true
  }

  move() {
    // noop
  }

  end() {
    this.#isStarted = false
    this.#endedCallbacks.call()
  }

  private itemFactory() {
    if (!this.original) throw new Error('Item and RenderingObject is not set.')

    const renderingObject = this.original.renderingObject.clone()
  
    return {item: new Coordinate(), renderingObject}
  }
}

export class HaconiwaLineItemGeneratorFactory<T extends Clonable<T>> implements HaconiwaItemGeneratorFactory<T> {
  create(renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster, initialClonedItem: HaconiwaItemGeneratorClonedItem<T>, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    const generator = new HaconiwaLineItemGenerator(renderer, raycaster, markerRaycaster, renderingObjectBuilder)
    generator.setOriginal(initialClonedItem)

    return generator
  }
}
