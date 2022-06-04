export const updateFromMatrix = (threejs3DObject, matrix) => {
  threejs3DObject.updateMatrix()
  threejs3DObject.matrix.fromArray(matrix)
  threejs3DObject.matrix.decompose(threejs3DObject.position, threejs3DObject.quaternion, threejs3DObject.scale)
}
