import { ThreeRenderer, ThreeRenderingObject } from './ThreeRenderer.js'
import { ThreeCamera } from './ThreeCamera.js'
import { CylinderGeometry, TetrahedronGeometry, MeshBasicMaterial, Mesh, Scene, Group } from 'three'
import { CameraSetupParameter, ObjectFactory } from '../ObjectFactory.js'
import { Vec3, VectorArray3 } from '../Matrix.js'
import { Item } from '../Item.js'
import { makeItem } from '../ItemFactory.js'

export class ThreeFactory implements ObjectFactory<ThreeRenderingObject> {
  makeRenderer(cameraParams: CameraSetupParameter) {
    const threeCamera = new ThreeCamera(cameraParams.fov, cameraParams.aspect, cameraParams.near, cameraParams.far)

    return new ThreeRenderer(new Scene(), threeCamera)
  }

  makeVectorMarkerRenderingObject(norm: number, baseItem: Item): ThreeRenderingObject {
    const cylinder = new CylinderGeometry(0.001, 0.001, norm, 8)
    const direction = new TetrahedronGeometry(0.03, 0)
    const material = new MeshBasicMaterial({color: 0xffff00})
    material.depthTest = false
    const directionMaterial = new MeshBasicMaterial({color: 0x0000ff})

    const cylinderMesh = new Mesh(cylinder, material)
    const directionMesh = new Mesh(direction, directionMaterial)

    cylinderMesh.position.y = -norm / 2
    directionMesh.position.y = -norm

    const group = new Group()
    group.add(cylinderMesh)
    group.add(directionMesh)

    return {
      item: group
    }
  }
}
