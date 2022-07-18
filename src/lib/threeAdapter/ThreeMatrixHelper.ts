import { Object3D } from 'three'

export const updateFromMatrix = (threejs3DObject: Object3D, matrix: Array<number>) => {
  threejs3DObject.updateMatrix()
  threejs3DObject.matrix.fromArray(matrix)
  threejs3DObject.matrix.decompose(threejs3DObject.position, threejs3DObject.quaternion, threejs3DObject.scale)
}
