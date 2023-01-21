import { LineItem, LineItemConnection } from "../../../../lib/LineItem.js"
import type { Raycaster } from "../../../../lib/Raycaster"
import type { Renderer } from "../../../../lib/Renderer"
import { LineSegmentGenerator } from '../../../../lib/itemGenerators/lineItemGenerator/lineGenerator/LineSegmentGenerator.js'
import type {
  HaconiwaItemGenerator,
  HaconiwaItemGeneratorFactory,
  HaconiwaItemGeneratorClonedItem,
  HaconiwaItemGeneratorLineConnectable,
  HaconiwaItemGeneratorItemClonable,
} from "./HaconiwaItemGenerator"
import { Coordinate } from "../../../../lib/Coordinate.js"
import { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder.js"
import { MouseButton, WindowCursor } from "../../../../lib/mouse/MouseControllable.js"
import { ColiderItemMap } from "../../../../lib/ColiderItemMap.js"
import { Vec3 } from "../../../../lib/Matrix.js"
import { markerJointable } from "../Markers/JointableMarker.js"
import { Joint } from "./Joints/Joint.js"
import { NoneJoint } from "./Joints/NoneJoint.js"
import { RenderingObject } from "../../../../lib/RenderingObject.js"
import { JointFactory } from "./Joints/JointFactory.js"
import { HaconiwaItemGeneratorBase } from "./HaconiwaItemGeneratorBase.js"
import { CenterMarker } from "../../../../lib/markers/CenterMarker.js"
import { ProxyHandler } from "../../../../lib/mouse/handlers/ProxyHandler.js"
import { PlaneMoveHandler } from "../../../../lib/mouse/handlers/PlaneMoveHandler.js"
import { Marker, MarkerRenderable } from "../../../../lib/markers/Marker.js"
import { DirectionalMarker } from "../../../../lib/markers/DirectionalMarker.js"
import { DirectionalMoveHandler } from "../../../../lib/mouse/handlers/DirectionalMoveHandler.js"

export class RouteItemGenerator<T extends RenderingObject>
  extends HaconiwaItemGeneratorBase<T>
  implements HaconiwaItemGenerator<T>, HaconiwaItemGeneratorLineConnectable, HaconiwaItemGeneratorItemClonable<T> {
  #planeRaycaster: Raycaster
  #markerRaycaster: Raycaster
  #renderingObjectBuilder: RenderingObjectBuilder<T>
  #renderer: Renderer<T>
  #coliderConnectionMap: ColiderItemMap<LineItemConnection> | null = null
  #jointFactory: JointFactory<T>
  #handlingMarkers: Array<Marker & MarkerRenderable> = []
  private original: HaconiwaItemGeneratorClonedItem<T> | null = null

  constructor(
    renderer: Renderer<T>,
    planeRaycaster: Raycaster,
    markerRaycaster: Raycaster,
    renderingObjectBuilder: RenderingObjectBuilder<T>,
    jointFactory: JointFactory<T>
  ) {
    super()

    this.#planeRaycaster = planeRaycaster
    this.#markerRaycaster = markerRaycaster
    this.#renderingObjectBuilder = renderingObjectBuilder
    this.#renderer = renderer
    this.#jointFactory = jointFactory

    this.#jointFactory.addOnReadyForRenderingCallback((joint: Joint<T>) => joint.updateRenderingObject(this.#renderingObjectBuilder, this.#renderer))
  }

  setOriginal(original: HaconiwaItemGeneratorClonedItem<T>) {
    this.original = original
  }

  setConnectorColiderMap(coliderConnectionMap: ColiderItemMap<LineItemConnection>) {
    this.#coliderConnectionMap = coliderConnectionMap
  }

  create(cursor: WindowCursor, button: MouseButton, cameraCoordinate: Coordinate) {
    if (!this.#planeRaycaster.hasColided || !this.#coliderConnectionMap) return

    if (this.isSelected) {
      const markerSelected = this.#handlingMarkers.some(handlingMarker => this.#markerRaycaster.colidedColiders.has(...handlingMarker.coliders))

      if (!markerSelected) {
        this.removeHandlingMarker()
        this.unselected(this)
      }
    }

    if (this.generated) return

    const coliderConnectionMap = this.#coliderConnectionMap
    const startPosition = this.#markerRaycaster.colidedDetails[0]?.colider.parentCoordinate?.position || this.#planeRaycaster.colidedDetails[0].position
    const endPosition = this.#planeRaycaster.colidedDetails[0].position

    const lineGenerator = new LineSegmentGenerator()
    lineGenerator.setStartPosition(startPosition)
    lineGenerator.setEndPosition(endPosition)

    const item = new LineItem(lineGenerator.getLine())

    const joints = new Map<LineItemConnection, Joint<T>>()
    item.connections.forEach(connection => joints.set(connection, new NoneJoint()))

    const coordinateForRendering = new Coordinate()
    item.parentCoordinate.addChild(coordinateForRendering)
    this.#renderer.addItem(coordinateForRendering, this.makeRenderingObject())

    //
    // Jointable markers
    //
    const jointableMarkers = item.connections.map(connection => {
      const marker = new CenterMarker(0.5)
      const handler = new PlaneMoveHandler(connection.edge.coordinate, [0, 1, 0], false, this.#renderer.camera)
      const proxyHandler = new ProxyHandler(this.#markerRaycaster, marker.coliders)

      proxyHandler.setStartedCallback(() => {
        const heightMarker = new DirectionalMarker(1, 0.1, [0, 1, 0], 1, true)
        const heightHandler = new DirectionalMoveHandler(connection.edge.coordinate, [0, 1, 0], 0.1)

        heightMarker.setParentCoordinate(connection.edge.coordinate)
        heightMarker.addHandler(heightHandler)
        heightMarker.attachRenderingObject({r: 0, g: 255, b: 0}, this.#renderingObjectBuilder, this.#renderer)
        this.registerMarker(heightMarker)
        this.#handlingMarkers.push(heightMarker)

        this.selected(this)
      })

      marker.addHandler(handler)
      marker.addHandler(proxyHandler)

      const jointableHandler = markerJointable(marker, handler, connection, item, this.#markerRaycaster, coliderConnectionMap)
      item.connections.filter(conn => conn !== connection).forEach(conn => jointableHandler.addIgnoredConnection(conn))

      marker.attachRenderingObject<T>({r: 255, g: 0, b: 0}, this.#renderingObjectBuilder, this.#renderer)
      marker.parentCoordinate.setUpdateCallback(() => {
        const jointsArray = Array.from(joints.values())
        this.updateRenderingObject(coordinateForRendering, item, item.line.length, jointsArray)

        jointsArray.forEach(joint => joint.updateRenderingObject(this.#renderingObjectBuilder, this.#renderer))
      })

      return {marker, handler: jointableHandler}
    })

    //
    // Connection events
    //
    item.connections.forEach(connection => {
      connection.setConnectedCallbacks(async () => {
        const joint = joints.get(connection)
        if (joint && !joint.disposed) {
          const recreatedJoint = this.updateJoint(joint, connection)
          joints.set(connection, recreatedJoint)
          this.updateRenderingObject(coordinateForRendering, item, item.line.length, Array.from(joints.values()))
        }
      })

      connection.setDisconnectedCallbacks(async () => {
        const joint = joints.get(connection)

        if (joint) {
          joint.dispose(this.#renderer)
          const recreatedJoint = this.updateJoint(joint, connection)
          joints.set(connection, recreatedJoint)
        }
      })
    })

    this.updateRenderingObject(coordinateForRendering, item, item.line.length, Array.from(joints.values()))

    this.registerItem(item)

    jointableMarkers.forEach(item => this.registerMarker(item.marker))

    jointableMarkers[1].marker.handlers.forEach(handler => handler.start(cursor, button, cameraCoordinate))

    return true
  }

  private updateJoint(givenJoint: Joint<T>, connection: LineItemConnection) {
    if (!connection.hasConnections() || !this.original) return new NoneJoint<T>()

    const edges = [
      connection.edge,
      ...connection.connections.map(connection => connection.edge)
    ]

    if (givenJoint.edgeCount === edges.length) {
      givenJoint.setEdges(edges)
      givenJoint.updateRenderingObject(this.#renderingObjectBuilder, this.#renderer)
      return givenJoint
    }

    const joint = this.#jointFactory.createJoint(edges.length)

    joint.setEdges(edges)
    joint.setWidth(this.original.renderingObject.size[0])

    joint.updateRenderingObject(this.#renderingObjectBuilder, this.#renderer)

    givenJoint.dispose(this.#renderer)

    return joint
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

  private removeHandlingMarker() {
    this.#handlingMarkers.forEach(marker => {
      this.removeMarker(marker)
      marker.markerCoordinates.forEach(coord => this.#renderer.removeItem(coord))
    })
    this.#handlingMarkers = []
  }
}

export class RouteItemGeneratorFactory<T extends RenderingObject> implements HaconiwaItemGeneratorFactory<T> {
  #jointFactory: JointFactory<T>
  #original: HaconiwaItemGeneratorClonedItem<T>

  constructor(jointFactory: JointFactory<T>, original: HaconiwaItemGeneratorClonedItem<T>) {
    this.#jointFactory = jointFactory
    this.#original = original
  }

  create(renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    const generator = new RouteItemGenerator(renderer, raycaster, markerRaycaster, renderingObjectBuilder, this.#jointFactory)
    generator.setOriginal(this.#original)

    return generator
  }
}
