import { Object3D } from "three";
import { Coordinate } from "../Coordinate";

export const syncCoordinate = (coordinate: Coordinate, renderingObj: Object3D) => {
  renderingObj.position.x = coordinate.x
  renderingObj.position.y = coordinate.y
  renderingObj.position.z = coordinate.z
  renderingObj.rotation.x = coordinate.rx
  renderingObj.rotation.y = coordinate.ry
  renderingObj.rotation.z = coordinate.rz
  renderingObj.updateMatrix()
  renderingObj.matrix.fromArray(coordinate.matrix)
  renderingObj.matrix.decompose(renderingObj.position, renderingObj.quaternion, renderingObj.scale)
}
