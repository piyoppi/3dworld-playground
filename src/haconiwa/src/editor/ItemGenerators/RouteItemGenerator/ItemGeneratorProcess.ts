import type { ItemGeneratorProcess as IItemGeneratorProcess, ItemGeneratorParams } from "../ItemGeneratorProcess"
import type { Joint } from "../../itemGenerators/Joints/Joint"
import type { JointFactory } from "../../itemGenerators/Joints/JointFactory"
import { LineSegmentGenerator } from "../../../../../lib/itemGenerators/lineItemGenerator/lineGenerator/LineSegmentGenerator.js"
import { LineItem } from "../../../../../lib/LineItem/LineItem.js"
import { LineItemConnection } from "../../../../../lib/LineItem/LineItemConnection.js"
import { NoneJoint } from "../../itemGenerators/Joints/NoneJoint.js"
import { RenderingObject } from "../../../../../lib/RenderingObject"
import { HaconiwaWorldItem } from '../../../World/HaconiwaWorldItem.js'
import { JointMarker } from "../../../../../lib/markers/JointMarker.js"
import { PlaneMoveHandler } from "../../../../../lib/mouse/handlers/PlaneMoveHandler.js"
import { DirectionalMarker } from "../../../../../lib/markers/DirectionalMarker.js"
import { DirectionalMoveHandler } from "../../../../../lib/mouse/handlers/DirectionalMoveHandler.js"
import { markerJointable } from "../../Markers/JointableMarker.js"
import { ProxyHandler } from "../../../../../lib/mouse/handlers/ProxyHandler.js"
import { Vec3 } from "../../../../../lib/Matrix.js"
import { HandlingProcess } from "./HandlingProcess.js"

export class ItemGeneratorProcess<T extends RenderingObject> implements IItemGeneratorProcess<T> {
  constructor(
    private original: T,
    private jointFactory: JointFactory<T>
  ) { }

  process({
    getPosition,
    register,
    registerMarker,
    removeMarker,
    select,
    getCamera,
    getRenderingObjectBuilder,
    addRenderingObject,
    removeRenderingObject,
    getMarkerRaycaster,
    cursor,
    button
  }: ItemGeneratorParams<T>): HandlingProcess {
    const position = getPosition()
    const lineGenerator = new LineSegmentGenerator(position, position)

    const camera = getCamera()

    const lineItem = new LineItem(lineGenerator.getLine())
    const joints = new Map<LineItemConnection, Joint<T>>()

    lineItem.connections.forEach(connection => joints.set(connection, new NoneJoint()))

    const renderingObject = this.original.clone() as T
    const item = new HaconiwaWorldItem(lineItem, [], [])
    const coordinateForRendering = register(item, renderingObject)
    const handlingProcess = new HandlingProcess()

    const jointableMarkers = lineItem.connections.map(connection => {
      const jointMarker = new JointMarker(0.5, connection)
      const handler = new PlaneMoveHandler(connection.edge.coordinate, [0, 1, 0], false, camera)
      const proxyHandler = new ProxyHandler(getMarkerRaycaster(), jointMarker.coliders)
      jointMarker.addHandler(handler)
      jointMarker.addHandler(proxyHandler)

      let heightHandler: DirectionalMoveHandler | null = null
      handler.setStartingCallback(() => !heightHandler?.isStart)

      proxyHandler.setStartedCallback(() => {
        // このマーカーにスナップしちゃっていてよくないので、どうにかしてスナップしないようにする
        const heightMarker = new DirectionalMarker(2, 0.1, [0, 1, 0], connection.edge.coordinate, 1.5, true)
        heightHandler = new DirectionalMoveHandler(connection.edge.coordinate, [0, 1, 0], 0.1)
        heightHandler.setStartingCallback(() => !handler.isStart)
        heightMarker.addHandler(heightHandler)
        heightMarker.setRenderingParameters({color: {r: 0, g: 255, b: 0}})

        registerMarker(heightMarker)

        select(heightMarker.coliders, handlingProcess, () => removeMarker(heightMarker))
      })

      return {
        marker: jointMarker,
        handler,
        connection
      }
    }).map(({ marker, handler, connection }, _, arr) => {
      const markers = arr.map(elm => elm.marker)
      const jointableHandler = markerJointable(marker, markers, handler, connection, getMarkerRaycaster())
      lineItem.connections.filter(conn => conn !== connection).forEach(conn => jointableHandler.addIgnoredConnection(conn))

      registerMarker(marker)

      return marker
    })
    jointableMarkers[1].handlers.forEach(handler => handler.start(cursor, button, camera.coordinate))

    const renderingObjectBuilder = getRenderingObjectBuilder()
    const updateJointRenderingObject = (joint: Joint<T>) => {
      joint.updateRenderingObject(renderingObjectBuilder).forEach(result => {
        removeRenderingObject(result.coordinate)
        addRenderingObject(result.coordinate, result.renderingObject)
      })
    }

    this.jointFactory.addOnReadyForRenderingCallback((joint: Joint<T>) => updateJointRenderingObject(joint))

    const updateRenderingObject = () => {
      const jointsArray = Array.from(joints.values())
      const offset = jointsArray.reduce((acc, joint) => acc + joint.getOffset(), 0)
      const itemScale = (lineItem.line.length - offset) / (this.original.size[0] || 1)
      coordinateForRendering.scale([1, 1, itemScale])
      renderingObject.material.repeat(itemScale, 1)

      const direction = Vec3.normalize(Vec3.subtract(lineItem.connections[1].position, lineItem.connections[0].position))
      const position =
        Vec3.add(
          lineItem.connections[0].edge.position,
          Vec3.add(
            Vec3.mulScale(direction, jointsArray[0].getOffset()),
            Vec3.mulScale(
              Vec3.subtract(
                Vec3.subtract(lineItem.connections[1].position, Vec3.mulScale(direction, jointsArray[1].getOffset())),
                Vec3.add(lineItem.connections[0].position, Vec3.mulScale(direction, jointsArray[0].getOffset()))
              ),
              0.5
            )
          )
      )
      coordinateForRendering.setDirectionZAxis(direction, position)
    }

    updateRenderingObject()

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
      updateRenderingObject()
      Array.from(joints.values()).forEach(joint => updateJointRenderingObject(joint))
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
          updateRenderingObject()
        }
      })

      connection.setDisconnectedCallbacks(async () => {
        const joint = joints.get(connection)

        if (joint) {
          disposeJoint(joint)
          const recreatedJoint = updateJoint(joint, connection)
          joints.set(connection, recreatedJoint)
          updateRenderingObject()
        }
      })
    })

    return handlingProcess
  }
}
