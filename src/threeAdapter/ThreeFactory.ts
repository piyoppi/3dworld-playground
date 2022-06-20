import { ThreeRenderer, ThreeRenderingObject } from './ThreeRenderer.js'
import { ThreeCamera } from './ThreeCamera.js'
import { Scene } from 'three'
import { CameraSetupParameter, ObjectFactory } from '../ObjectFactory.js'

export class ThreeFactory implements ObjectFactory<ThreeRenderingObject> {
  makeRenderer(cameraParams: CameraSetupParameter) {
    const threeCamera = new ThreeCamera(cameraParams.fov, cameraParams.aspect, cameraParams.near, cameraParams.far)

    return new ThreeRenderer(new Scene(), threeCamera)
  }
}
