//import { RaycastMoveHandler } from "../../mouse/handlers/RaycastMoveHandler.js"
//import { CenterMarker } from "../CenterMarker.js"
//import { Coordinate } from "../../Coordinate"
//import { RenderingObjectBuilder } from "../../RenderingObjectBuilder.js"
//import type { Renderer } from "../../Renderer"
//import { RenderingObject } from "../../RenderingObject.js"
//import { Raycaster } from "../../Raycaster.js"
//import { BallColider } from '../../Colider.js'

//export function makeCoordinateRaycastedPlaneMover<T extends RenderingObject>(planeRaycaster: Raycaster, markerRaycaster: Raycaster, parentCoordinate: Coordinate, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
//  const markerRadius = 0.5 
//  const marker = new CenterMarker(new BallColider(markerRadius, parentCoordinate))
//  const moveHandler = new RaycastMoveHandler(parentCoordinate, planeRaycaster, markerRaycaster, marker.coliders)
//  marker.attachRenderingObject({r: 255, g: 0, b: 0}, markerRadius, builder, renderer)
//  marker.addHandler(moveHandler)
//
//  return {marker, handlers: [moveHandler]}
//}
