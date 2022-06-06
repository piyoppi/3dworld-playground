import * as THREE from 'three'
import { Item } from './Item.js'

export const makeWireframeLines = obj => {
  const wireframes = getMeshes(obj).map(mesh => new THREE.WireframeGeometry(mesh.geometry))
  return wireframes.map(wireframe => {
    const line = new THREE.LineSegments(wireframe)
    line.material.depthTest = false
    line.material.opacity = 0.25
    line.material.transparent = true

    return line
  })
}

export const makeBoneMesh = (obj, scene) => {
  const geometry = new THREE.SphereGeometry(
    0.03,
    5,
    5
  )
  const material = new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff}) 
  const mesh = new THREE.Mesh(geometry, material)
  mesh.material.depthTest = false

  const mat = transformMatrixFrom3dObj(obj, scene)
  mesh.applyMatrix4(mat)

  return mesh
}

const transformMatrixFrom3dObj = (ref, root, mat = ref.matrix.clone()) => {
  if (root.uuid === ref.parent.uuid) return mat
  const calcmat = mat.premultiply(ref.parent.matrix.clone())
  return transformMatrixFrom3dObj(ref.parent, root, calcmat.clone())
}
