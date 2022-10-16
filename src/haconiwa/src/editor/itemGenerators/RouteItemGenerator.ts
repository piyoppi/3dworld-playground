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
import { makeConnectionMarker } from './Helpers/MakeConnectionMarker.js'
import { Vec3 } from "../../../../lib/Matrix.js"
import { RenderingObject } from "../../../../lib/RenderingObject.js"
import { JointableMarker } from "../Markers/JointableMarker.js"
import { createJoint } from "./Joints/JointFactory.js"

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
    if (!this.#planeRaycaster.hasColided || !this.#coliderConnectionMap || this.#isStarted) return

    this.#isStarted = true

    const coliderConnectionMap = this.#coliderConnectionMap
    const lineGenerator = new LineSegmentGenerator()
    const startPosition = this.#markerRaycaster.colidedDetails[0]?.colider.parentCoordinate?.position || this.#planeRaycaster.colidedDetails[0].position
    const endPosition = this.#planeRaycaster.colidedDetails[0].position
    lineGenerator.setStartPosition(startPosition)
    lineGenerator.setEndPosition(endPosition)

    const line = lineGenerator.getLine()
    const item = new LineItem(line)
    item.parentCoordinate.lookAt(startPosition)

    const jointableMarkers = item.connections.map(connection => new JointableMarker(connection, this.#markerRaycaster, this.#planeRaycaster, coliderConnectionMap))

    jointableMarkers.forEach((jointableMarker, index) => {
      jointableMarker.marker.attachRenderingObject<T>({r: 255, g: 0, b: 0}, this.#renderingObjectBuilder,this.#renderer)

      jointableMarker.jointHandler.setConnectedCallbacks(() => {
        console.log('jointed', jointableMarker.connection.connections.length)
        const joint = createJoint(jointableMarker.connection.connections.length)
        if (!joint) return

        const directions = jointableMarker.connection.connections.map(connection => line.getDirection(connection.edge.t))
        
        joint.setConnectedDirections(directions)
        joint.setWidth(1)

        const coordinate = new Coordinate()
        coordinate.position = jointableMarker.connection.edge.position
        item.parentCoordinate.addChild(coordinate)
        this.#renderer.addItem(coordinate, joint.makeRenderingObject(this.#renderingObjectBuilder))

        const offset = joint.getOffset()
      })

      jointableMarker.jointHandler.setDisconnectedCallbacks(() => {

      })

      jointableMarker.marker.parentCoordinate.setUpdateCallback(() => {
        item.line.setEdge(index, jointableMarker.marker.parentCoordinate.position)
        this.updateRenderingObject(item, item.line.length, 0)
      })
    })

    const renderingObject = this.makeRenderingObject()
    this.#renderer.addItem(item.parentCoordinate, renderingObject)

    this.#onGeneratedCallbacks.forEach(func => func([new HaconiwaWorldItem(item, [], jointableMarkers.map(item => item.marker))]))

    this.#startedCallbacks.call()

    jointableMarkers[1].marker.handlers.forEach(handler => handler.start(x, y, button, cameraCoordinate))

    return true
  }

  move() {
    // noop
  }

  end() {
    this.#isStarted = false
    this.#endedCallbacks.call()
  }

  private buildRenderingSection() {

  }

  private makeRenderingObject() {
    if (!this.original) throw new Error('Item and RenderingObject is not set.')

    return this.original.renderingObject.clone()
  }

  private updateRenderingObject(lineItem: LineItem, length: number, offset: number) {
    const itemScale = length / (this.original?.renderingObject.size[0] || 1)
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
