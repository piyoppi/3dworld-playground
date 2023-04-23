import { StartProcess as IStartProcess, StartParmas } from "../StartProcess"
import { MoveProcess as IMoveProcess } from "../MoveProcess"
import { MoveProcess } from './MoveProcess.js'
import { LineSegmentGenerator } from "../../../../../lib/itemGenerators/lineItemGenerator/lineGenerator/LineSegmentGenerator"
import { LineItem } from "../../../../../lib/LineItem/LineItem"
import { LineItemConnection } from "../../../../../lib/LineItem/LineItemConnection"
import { Joint } from "../../itemGenerators/Joints/Joint"
import { NoneJoint } from "../../itemGenerators/Joints/NoneJoint"
import { RenderingObject } from "../../../../../lib/RenderingObject"
import { HaconiwaWorldItem } from '../../../World/HaconiwaWorldItem'
import { JointMarker } from "../../../../../lib/markers/JointMarker.js"
import { PlaneMoveHandler } from "../../../../../lib/mouse/handlers/PlaneMoveHandler.js"
import { DirectionalMarker } from "../../../../../lib/markers/DirectionalMarker.js"
import { DirectionalMoveHandler } from "../../../../../lib/mouse/handlers/DirectionalMoveHandler.js"
import { markerJointable } from "../../Markers/JointableMarker.js"
import { ProxyHandler } from "../../../../../lib/mouse/handlers/ProxyHandler.js"
import { Coordinate } from "../../../../../lib/Coordinate"
import { Vec3 } from "../../../../../lib/Matrix"
import { JointFactory } from "../../itemGenerators/Joints/JointFactory"
import { ColiderItemMap } from "../../../../../lib/ColiderItemMap"

export class StartProcess<T extends RenderingObject> implements IStartProcess<T> {
  constructor(
    private original: RenderingObject,
    private jointFactory: JointFactory<T>
  ) { }

  start({
    position,
    register,
    registerMarker,
    select,
    getCamera,
    getRenderingObjectBuilder,
    addRenderingObject,
    removeRenderingObject,
    getMarkerRaycaster,
    cursor,
    button
  }: StartParmas<T>): IMoveProcess {
    const lineGenerator = new LineSegmentGenerator()
    lineGenerator.setStartPosition(position)
    lineGenerator.setEndPosition(position)

    const renderingObjectBuilder = getRenderingObjectBuilder()
    const camera = getCamera()
    const markerRaycaster = getMarkerRaycaster()

    const lineItem = new LineItem(lineGenerator.getLine())
    const item = new HaconiwaWorldItem(lineItem, [], [])
    const joints = new Map<LineItemConnection, Joint<T>>()
    const coliderConnectionMap = new ColiderItemMap<LineItemConnection>()

    lineItem.connections.forEach(connection => joints.set(connection, new NoneJoint()))

    const renderingObject = this.original.clone()
    const coordinateForRendering = register(item, renderingObject)

    const jointableMarkers = lineItem.connections.map(connection => {
      const marker = new JointMarker(0.5, connection.edge.coordinate)
      const handler = new PlaneMoveHandler(connection.edge.coordinate, [0, 1, 0], false, camera)
      const proxyHandler = new ProxyHandler(markerRaycaster, marker.coliders)
      let heightHandler: DirectionalMoveHandler | null = null
      handler.setStartingCallback(() => !heightHandler?.isStart)

      proxyHandler.setStartedCallback(() => {
        // このマーカーにスナップしちゃっていてよくないので、どうにかしてスナップしないようにする
        const heightMarker = new DirectionalMarker(1, 0.1, [0, 1, 0], connection.edge.coordinate, 1.5, true)
        heightHandler = new DirectionalMoveHandler(connection.edge.coordinate, [0, 1, 0], 0.1)
        heightHandler.setStartingCallback(() => !handler.isStart)
        heightMarker.addHandler(heightHandler)

        registerMarker(heightMarker)

        select()
      })

      marker.addHandler(handler)
      marker.addHandler(proxyHandler)

      return {
        marker,
        handler,
        connection
      }
    }).map((created, _, arr) => {
      const { marker, handler, connection } = created
      const markers = arr.map(elm => elm.marker)
      const jointableHandler = markerJointable(marker, markers, handler, connection, markerRaycaster, coliderConnectionMap)
      lineItem.connections.filter(conn => conn !== connection).forEach(conn => jointableHandler.addIgnoredConnection(conn))

      registerMarker(marker)

      return marker
    })

    const updateJointRenderingObject = (joint: Joint<T>) => {
      const results = joint.updateRenderingObject(renderingObjectBuilder)

      results.forEach(result => {
        removeRenderingObject(result.coordinate)
        addRenderingObject(result.coordinate, result.renderingObject)
      })
    }

    const updateRenderingObject = (joints: Joint<T>[]) => {
      const offset = joints.reduce((acc, joint) => acc + joint.getOffset(), 0)
      const itemScale = (lineItem.line.length - offset) / (this.original.size[0] || 1)
      coordinateForRendering.scale([1, 1, itemScale])
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
      coordinateForRendering.setDirectionZAxis(direction, position)
    }

    const updateJoint = (givenJoint: Joint<T>, connection: LineItemConnection) => {
      if (!connection.hasConnections() || !this.original) return new NoneJoint<T>()

        const edges = [
          connection.edge,
          ...connection.connections.map(connection => connection.edge)
        ]

        if (givenJoint.edgeCount === edges.length) {
          givenJoint.setEdges(edges)
          updateJointRenderingObject(givenJoint)
          return givenJoint
        }

        const joint = this.jointFactory.createJoint(edges.length)

        joint.setEdges(edges)
        joint.setWidth(this.original.size[0])

        updateJointRenderingObject(joint)

        disposeJoint(givenJoint)

        return joint
    }

    const refreshLine = () => {
      const jointsArray = Array.from(joints.values())
      updateRenderingObject(jointsArray)

      jointsArray.forEach(joint => updateJointRenderingObject(joint))
    }

    lineItem.setUpdatedCallback(() => refreshLine())
    lineItem.setConnectedLineUpdatedCallback(() => refreshLine())

    const disposeJoint = (joint: Joint<T>) => {
      joint.dispose(coordinates => {
        coordinates.forEach(coordinate => removeRenderingObject(coordinate))
        return true
      })
    }

    lineItem.connections.forEach(connection => {
      connection.setConnectedCallbacks(async () => {
        const joint = joints.get(connection)
        if (joint && !joint.disposed) {
          const recreatedJoint = updateJoint(joint, connection)
          joints.set(connection, recreatedJoint)
          updateRenderingObject(Array.from(joints.values()))
        }
      })

      connection.setDisconnectedCallbacks(async () => {
        const joint = joints.get(connection)

        if (joint) {
          disposeJoint(joint)
          const recreatedJoint = updateJoint(joint, connection)
          joints.set(connection, recreatedJoint)
          updateRenderingObject(Array.from(joints.values()))
        }
      })
    })

    updateRenderingObject(Array.from(joints.values()))

    jointableMarkers.forEach(item => registerMarker(item))

    jointableMarkers[1].handlers.forEach(handler => handler.start(cursor, button, camera.coordinate))

    return new MoveProcess()
  }
}
