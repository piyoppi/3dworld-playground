import type { Coordinate } from "../../Coordinate"
import type { Camera } from "../../Camera"
import type { ReadOnlyRaycaster } from "../../ReadOnlyRaycaster"
import { makeCoordinateDirectionalMover } from "./CoordinateDirectionalMover.js"
import { makeCoordinatePlanesMover } from "./CoordinatePlanesMover.js"
import { makeCoordinateRotator } from "./CoordinateRotator.js"

export function makeCoordinateMover(markerRaycaster: ReadOnlyRaycaster, manipulatedCoordinate: Coordinate, camera: Camera) {
  const directionalMover = makeCoordinateDirectionalMover(manipulatedCoordinate)
  const planeMover = makeCoordinatePlanesMover(manipulatedCoordinate, camera, true)
  const rotator = makeCoordinateRotator(markerRaycaster, manipulatedCoordinate, camera)

  const startingHookFn = () => !planeMover.handlers.some(handler => handler.isStart) &&
    !rotator.handlers.some(handler => handler.isStart) &&
    !directionalMover.handlers.some(handler => handler.isStart)

  directionalMover.handlers.forEach(handler => handler.setStartingCallback(startingHookFn))
  planeMover.handlers.forEach(handler => handler.setStartingCallback(startingHookFn))
  rotator.handlers.forEach(handler => handler.setStartingCallback(startingHookFn))

  return [
    directionalMover.marker,
    planeMover.marker,
    rotator.marker
  ]
}
