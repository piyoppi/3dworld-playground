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

  makeVectorMarkerRenderingObject(vector: VectorArray3, baseItem: Item): ThreeRenderingObject {
    const norm = Vec3.norm(vector)
    const cylinder = new CylinderGeometry(0.01, 0.01, norm, 8)
    const direction = new TetrahedronGeometry(0.1, 0)
    const material = new MeshBasicMaterial({color: 0xffff00})
    const directionMaterial = new MeshBasicMaterial({color: 0x0000ff})

    const cylinderMesh = new Mesh(cylinder, material)
    const directionMesh = new Mesh(direction, directionMaterial)

    directionMesh.position.y = norm / 2
    directionMesh.rotateY(Math.PI / 4)
    directionMesh.rotateX(Math.PI / 4)
    directionMesh.rotateZ(Math.PI / 4)

    const group = new Group()
    group.add(cylinderMesh)
    group.add(directionMesh)

    return {
      item: group
    }
  }
}
