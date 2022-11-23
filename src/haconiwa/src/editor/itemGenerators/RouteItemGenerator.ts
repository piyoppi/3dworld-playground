import { LineItem, LineItemConnection } from "../../../../lib/LineItem.js"
import type { Raycaster } from "../../../../lib/Raycaster"
import type { Renderer } from "../../../../lib/Renderer"
import { LineSegmentGenerator } from '../../../../lib/itemGenerators/lineItemGenerator/lineGenerator/LineSegmentGenerator.js'
import type {
  HaconiwaItemGenerator,
  HaconiwaItemGeneratorFactory,
  HaconiwaItemGeneratorClonedItem,
  HaconiwaItemGeneratedCallback,
  HaconiwaItemGeneratorLineConnectable,
  HaconiwaItemGeneratorItemClonable,
} from "./HaconiwaItemGenerator"
import { Coordinate } from "../../../../lib/Coordinate.js"
import { HaconiwaWorldItem } from "../../world.js"
import { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder.js"
import { MouseButton, MouseControllableCallbackFunction } from "../../../../lib/mouse/MouseControllable.js"
import { CallbackFunctions } from "../../../../lib/CallbackFunctions.js"
import { ColiderItemMap } from "../../../../lib/ColiderItemMap.js"
import { Vec3 } from "../../../../lib/Matrix.js"
import { JointableMarker } from "../Markers/JointableMarker.js"
import { Joint } from "./Joints/Joint.js"
import { NoneJoint } from "./Joints/NoneJoint.js"
import { attachCoordinateRenderingItem } from "../../../../lib/CoordinateRenderingObject.js"
import { RenderingObject } from "../../../../lib/RenderingObject.js"
import { JointFactory } from "./Joints/JointFactory.js"

export class RouteItemGenerator<T extends RenderingObject>
  implements HaconiwaItemGenerator<T>, HaconiwaItemGeneratorLineConnectable, HaconiwaItemGeneratorItemClonable<T> {
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback<T>> = []
  #planeRaycaster: Raycaster
  #markerRaycaster: Raycaster
  #renderingObjectBuilder: RenderingObjectBuilder<T>
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #endedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #isStarted = false
  #renderer: Renderer<T>
  #coliderConnectionMap: ColiderItemMap<LineItemConnection> | null = null
  #jointFactory: JointFactory<T>
  private original: HaconiwaItemGeneratorClonedItem<T> | null = null

  constructor(
    renderer: Renderer<T>,
    planeRaycaster: Raycaster,
    markerRaycaster: Raycaster,
    renderingObjectBuilder: RenderingObjectBuilder<T>,
    jointFactory: JointFactory<T>
  ) {
    this.#planeRaycaster = planeRaycaster
    this.#markerRaycaster = markerRaycaster
    this.#renderingObjectBuilder = renderingObjectBuilder
    this.#renderer = renderer
    this.#jointFactory = jointFactory
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
    const startPosition = this.#markerRaycaster.colidedDetails[0]?.colider.parentCoordinate?.position || this.#planeRaycaster.colidedDetails[0].position
    const endPosition = this.#planeRaycaster.colidedDetails[0].position

    const lineGenerator = new LineSegmentGenerator()
    lineGenerator.setStartPosition(startPosition)
    lineGenerator.setEndPosition(endPosition)
    const line = lineGenerator.getLine()

    const item = new LineItem(line)

    const jointableMarkers = item.connections.map(connection => {
      const marker = new JointableMarker(connection, item, this.#markerRaycaster, this.#planeRaycaster, coliderConnectionMap)
      item.connections.filter(conn => conn !== connection).forEach(conn => marker.setIgnoredConnection(conn))

      marker.attachRenderingObject<T>({r: 255, g: 0, b: 0}, this.#renderingObjectBuilder, this.#renderer)
      marker.setUpdatedCoordinateCallback(() => {
        const jointsArray = Array.from(joints.values())
        this.updateRenderingObject(coordinateForRendering, item, item.line.length, jointsArray)

        jointsArray.forEach(joint => this.updateJoint(joint, item, marker.connection))
      })

      return marker
    })

    const joints = new Map<LineItemConnection, Joint<T>>()
    item.connections.forEach(connection => joints.set(connection, new NoneJoint()))

    const coordinateForRendering = new Coordinate()
    item.parentCoordinate.addChild(coordinateForRendering)

    item.connections.forEach(connection => {
      connection.setConnectedCallbacks(async () => {
        const joint = joints.get(connection)
        if (joint) {
          const recreatedJoint = await this.createJoint(joint, connection)
          this.updateJoint(recreatedJoint, item, connection)
          joints.set(connection, recreatedJoint)
          // [FIXME] for debug.
          attachCoordinateRenderingItem(connection.edge.coordinate, this.#renderingObjectBuilder, this.#renderer, 1, 0.2)
        }
      })

      connection.setDisconnectedCallbacks(async () => {
        const joint = joints.get(connection)

        if (joint) {
          const recreatedJoint = await this.createJoint(joint, connection)
          this.updateJoint(recreatedJoint, item, connection)
          joints.set(connection, recreatedJoint)
          joint.dispose(this.#renderer)
        }
      })
    })

    this.#renderer.addItem(coordinateForRendering, this.makeRenderingObject())
    this.updateRenderingObject(coordinateForRendering, item, item.line.length, Array.from(joints.values()))

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

  private async createJoint(givenJoint: Joint<T>, connection: LineItemConnection) {
    if (!connection.hasConnections() || !this.original) return new NoneJoint<T>()

    const edges = [
      connection.edge,
      ...connection.connections.map(connection => connection.edge)
    ]

    const joint = givenJoint.edgeCount !== edges.length ?
      await this.#jointFactory.createJoint(edges.length) :
      givenJoint

    joint.setEdges(edges)
    joint.setWidth(this.original.renderingObject.size[0])

    return joint
  }

  private updateJoint(joint: Joint<T>, item: LineItem, connection: LineItemConnection) {
    joint.updateRenderingObject(this.#renderingObjectBuilder, this.#renderer)
  }

  private makeRenderingObject() {
    if (!this.original) throw new Error('Item and RenderingObject is not set.')

    return this.original.renderingObject.clone() as T
  }

  private updateRenderingObject(coordinate: Coordinate, lineItem: LineItem, length: number, joints: Joint<T>[]) {
    const offset = joints.reduce((acc, joint) => acc + joint.getOffset(), 0)
    const itemScale = (length - offset) / (this.original?.renderingObject.size[0] || 1)
    coordinate.scale([1, 1, itemScale])

    const renderingItem = this.#renderer.renderingObjectFromCoordinate(coordinate)

    if (renderingItem) {
      renderingItem.material.repeat(itemScale, 1)
    }

    const direction = Vec3.normalize(Vec3.subtract(lineItem.connections[1].position, lineItem.connections[0].position))
    const position =
      Vec3.add(
        lineItem.connections[0].edge.position,
        Vec3.add(
          Vec3.mulScale(direction, joints[0].getOffset()),
          Vec3.mulScale(
            Vec3.subtract(
              Vec3.subtract(lineItem.connections[1].position, Vec3.mulScale(direction, joints[1].getOffset())),
              Vec3.add(lineItem.connections[0].position, Vec3.mulScale(direction, joints[0].getOffset()))
            ),
            0.5
          )
        )
      )
    coordinate.setDirectionZAxis(direction, position)
  }
}

export class RouteItemGeneratorFactory<T extends RenderingObject> implements HaconiwaItemGeneratorFactory<T> {
  #jointFactory: JointFactory<T>

  constructor(jointFactory: JointFactory<T>) {
    this.#jointFactory = jointFactory
  }

  create(renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    const generator = new RouteItemGenerator(renderer, raycaster, markerRaycaster, renderingObjectBuilder, this.#jointFactory)

    return generator
  }
}
