import { Object3D } from "three";
import { Coordinate } from "../Coordinate";

export const syncCoordinate = (coordinate: Coordinate, renderingObj: Object3D) => {
  renderingObj.updateMatrix()
  renderingObj.matrix.fromArray(coordinate.matrix)
  renderingObj.matrix.decompose(renderingObj.position, renderingObj.quaternion, renderingObj.scale)
}
