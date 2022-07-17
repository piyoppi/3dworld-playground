import { RenderingObjectBuilder } from '../RenderingObjectBuilder.js'
import { ThreeRenderingObject } from "./ThreeRenderer.js"
import { CylinderGeometry, TetrahedronGeometry, MeshBasicMaterial, Mesh, Group } from 'three'
import { Item } from '../Item.js'

export class ThreeRenderingObjectBuilder implements RenderingObjectBuilder<ThreeRenderingObject> {
  makeVectorRenderingObject(norm: number) {
    const cylinder = new CylinderGeometry(0.001, 0.001, norm, 8)
    const direction = new TetrahedronGeometry(0.015, 0)
    const material = new MeshBasicMaterial({color: 0xffff00})
    const directionMaterial = new MeshBasicMaterial({color: 0x0000ff})
    material.depthTest = false
    directionMaterial.depthTest = false

    const cylinderMesh = new Mesh(cylinder, material)
    const directionMesh = new Mesh(direction, directionMaterial)

    cylinderMesh.position.y = norm / 2
    directionMesh.position.y = norm

    directionMesh.rotateZ(Math.PI / 4)
    directionMesh.rotateY(Math.PI / 4)

    const group = new Group()
    group.add(cylinderMesh)
    group.add(directionMesh)

    return {
      item: group
    }
  }
}