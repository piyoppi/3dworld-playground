import { LineItem, LineItemConnection } from "../../../../lib/LineItem/index.js"
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
import { ColiderItemMap } from "../../../../lib/ColiderItemMap.js"
import { Vec3 } from "../../../../lib/Matrix.js"
import { markerJointable } from "../Markers/JointableMarker.js"
import { Joint } from "./Joints/Joint.js"
import { NoneJoint } from "./Joints/NoneJoint.js"
import { RenderingObject } from "../../../../lib/RenderingObject.js"
import { JointFactory } from "./Joints/JointFactory.js"
import { CreateParams, HaconiwaItemGeneratorBase } from "./HaconiwaItemGeneratorBase.js"
import { ProxyHandler } from "../../../../lib/mouse/handlers/ProxyHandler.js"
import { PlaneMoveHandler } from "../../../../lib/mouse/handlers/PlaneMoveHandler.js"
import { Marker, MarkerRenderable } from "../../../../lib/markers/Marker.js"
import { DirectionalMarker } from "../../../../lib/markers/DirectionalMarker.js"
import { DirectionalMoveHandler } from "../../../../lib/mouse/handlers/DirectionalMoveHandler.js"
import { JointMarker } from "../../../../lib/markers/JointMarker.js"
import { CoordinatedColider } from "../../../../lib/Colider.js"

export class RouteItemGenerator<T extends RenderingObject>
  extends HaconiwaItemGeneratorBase<T>
  implements HaconiwaItemGenerator<T>, HaconiwaItemGeneratorLineConnectable, HaconiwaItemGeneratorItemClonable<T> {
  #planeRaycaster: Raycaster
  #markerRaycaster: Raycaster<CoordinatedColider>
  #renderingObjectBuilder: RenderingObjectBuilder<T>
  #renderer: Renderer<T>
  #coliderConnectionMap: ColiderItemMap<LineItemConnection> | null = null
  #jointFactory: JointFactory<T>
  #handlingMarkers: Array<Marker & MarkerRenderable> = []
  #jointableMarkers: Array<JointMarker> = []
  private original: HaconiwaItemGeneratorClonedItem<T> | null = null

  constructor(
    renderer: Renderer<T>,
    planeRaycaster: Raycaster,
    markerRaycaster: Raycaster<CoordinatedColider>,
    renderingObjectBuilder: RenderingObjectBuilder<T>,
    jointFactory: JointFactory<T>
  ) {
    super(markerRaycaster)

    this.#planeRaycaster = planeRaycaster
    this.#markerRaycaster = markerRaycaster
    this.#renderingObjectBuilder = renderingObjectBuilder
    this.#renderer = renderer
    this.#jointFactory = jointFactory

    this.#jointFactory.addOnReadyForRenderingCallback((joint: Joint<T>) => this.updateJointRenderingObject(joint))
  }

  setOriginal(original: HaconiwaItemGeneratorClonedItem<T>) {
    this.original = original
  }

  setConnectorColiderMap(coliderConnectionMap: ColiderItemMap<LineItemConnection>) {
    this.#coliderConnectionMap = coliderConnectionMap
  }

  create({cursor, button, cameraCoordinate, unselected, selected, registerItem}: CreateParams) {
    if (!this.#planeRaycaster.colided || !this.#coliderConnectionMap) return

    if (this.isSelected) {
      const markerSelected = this.#handlingMarkers.some(handlingMarker => this.#markerRaycaster.colidedColiders.has(...handlingMarker.coliders))

      if (!markerSelected) {
        this.removeHandlingMarker()
        unselected()
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
    const renderingObject = this.makeRenderingObject()
    this.#renderer.addItem(coordinateForRendering, renderingObject)

    //
    // Jointable markers
    //
    const jointableMarkers = item.connections.map(connection => {
      const marker = new JointMarker(0.5, connection)
      const handler = new PlaneMoveHandler(connection.edge.coordinate, [0, 1, 0], false, this.#renderer.camera)
      const proxyHandler = new ProxyHandler(this.#markerRaycaster.getReadonly(), marker.coliders)
      let heightHandler: DirectionalMoveHandler | null = null
      handler.setStartingCallback(() => !heightHandler?.isStart)

      proxyHandler.setStartedCallback(() => {
        // このマーカーにスナップしちゃっていてよくないので、どうにかしてスナップしないようにする
        const heightMarker = new DirectionalMarker(1, 0.1, [0, 1, 0], connection.edge.coordinate, 1.5, true)
        heightHandler = new DirectionalMoveHandler(connection.edge.coordinate, [0, 1, 0], 0.1)
        heightHandler.setStartingCallback(() => !handler.isStart)

        heightMarker.addHandler(heightHandler)
        heightMarker.attachRenderingObject({r: 0, g: 255, b: 0}, this.#renderingObjectBuilder, this.#renderer)

        this.registerMarker(heightMarker)
        this.#handlingMarkers.push(heightMarker)

        selected()
      })

      marker.addHandler(handler)
      marker.addHandler(proxyHandler)

      return {
        marker,
        handler,
        connection
      }
    }).map((created, _, arr) => {
      const {marker, handler, connection} = created
      const markers = arr.map(elm => elm.marker)
      const jointableHandler = markerJointable(marker, markers, handler, connection, this.#markerRaycaster.getReadonly())
      item.connections.filter(conn => conn !== connection).forEach(conn => jointableHandler.addIgnoredConnection(conn))
      marker.attachRenderingObject<T>({r: 255, g: 0, b: 0}, this.#renderingObjectBuilder, this.#renderer)

      return marker
    })

    this.#jointableMarkers = jointableMarkers

    const refreshLine = () => {
      const jointsArray = Array.from(joints.values())
      this.updateRenderingObject(coordinateForRendering, renderingObject, item, item.line.length, jointsArray)

      jointsArray.forEach(joint => this.updateJointRenderingObject(joint))
    }
    item.setUpdatedCallback(() => refreshLine())
    item.setConnectedLineUpdatedCallback(() => refreshLine())

    //
    // Connection events
    //
    item.connections.forEach(connection => {
      connection.setConnectedCallbacks(async () => {
        const joint = joints.get(connection)
        if (joint && !joint.disposed) {
          const recreatedJoint = this.updateJoint(joint, connection)
          joints.set(connection, recreatedJoint)
          this.updateRenderingObject(coordinateForRendering, renderingObject, item, item.line.length, Array.from(joints.values()))
        }
      })

      connection.setDisconnectedCallbacks(async () => {
        const joint = joints.get(connection)

        if (joint) {
          this.disposeJoint(joint)
          const recreatedJoint = this.updateJoint(joint, connection)
          joints.set(connection, recreatedJoint)
          this.updateRenderingObject(coordinateForRendering, renderingObject, item, item.line.length, Array.from(joints.values()))
        }
      })
    })

    this.updateRenderingObject(coordinateForRendering, renderingObject, item, item.line.length, Array.from(joints.values()))

    registerItem(item)

    jointableMarkers.forEach(item => this.registerMarker(item))

    jointableMarkers[1].handlers.forEach(handler => handler.start(cursor, button, cameraCoordinate))

    return true
  }

  unselect() {
    this.removeHandlingMarker()
  }

  dispose() {
    if (!this.generated) return

    this.removeHandlingMarker()
    this.#jointableMarkers.forEach(marker => {
      this.removeMarker(marker)
      marker.markerCoordinates.forEach(coord => this.#renderer.removeItem(coord))
    })
    this.#jointableMarkers = []
  }

  private updateJoint(givenJoint: Joint<T>, connection: LineItemConnection) {
    if (!connection.hasConnections() || !this.original) return new NoneJoint<T>()

    const edges = [
      connection.edge,
      ...connection.connections.map(connection => connection.edge)
    ]

    if (givenJoint.edgeCount === edges.length) {
      givenJoint.setEdges(edges)
      this.updateJointRenderingObject(givenJoint)
      return givenJoint
    }

    const joint = this.#jointFactory.createJoint(edges.length)

    joint.setEdges(edges)
    joint.setWidth(this.original.renderingObject.size[0])

    this.updateJointRenderingObject(joint)

    this.disposeJoint(givenJoint)

    return joint
  }

  private disposeJoint(joint: Joint<T>) {
    joint.dispose(coordinates => {
      coordinates.forEach(coordinate => this.#renderer.removeItem(coordinate))

      return true
    })
  }

  private updateJointRenderingObject(joint: Joint<T>) {
    const results = joint.updateRenderingObject(this.#renderingObjectBuilder)

    results.forEach(result => {
      this.#renderer.removeItem(result.coordinate)
      this.#renderer.addItem(result.coordinate, result.renderingObject)
    })
  }

  private makeRenderingObject() {
    if (!this.original) throw new Error('Item and RenderingObject is not set.')

    return this.original.renderingObject.clone() as T
  }

  private updateRenderingObject(coordinate: Coordinate, renderingObject: RenderingObject, lineItem: LineItem, length: number, joints: Joint<T>[]) {
    const offset = joints.reduce((acc, joint) => acc + joint.getOffset(), 0)
    const itemScale = (length - offset) / (this.original?.renderingObject.size[0] || 1)
    coordinate.scale([1, 1, itemScale])
    renderingObject.material.repeat(itemScale, 1)

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

  create(renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster<CoordinatedColider>, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    const generator = new RouteItemGenerator(renderer, raycaster, markerRaycaster, renderingObjectBuilder, this.#jointFactory)
    generator.setOriginal(this.#original)

    return generator
  }
}
