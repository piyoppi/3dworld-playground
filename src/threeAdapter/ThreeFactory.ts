import { ThreeRenderer, ThreeRenderingObject } from './ThreeRenderer.js'
import { ThreeCamera } from './ThreeCamera.js'
import { CylinderGeometry, MeshBasicMaterial, Scene } from 'three'
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
    const geometry = new CylinderGeometry(0.01, 0.01, norm, 8)
    const material = new MeshBasicMaterial({color: 0xffff00})

    material.depthTest = false

    return {
      item: {
        geometry,
        material
      }
    }
  }
}
