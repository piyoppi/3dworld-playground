import { Camera } from './Camera.js'
import { Scene } from './Scene.js'
import { Renderer } from "./Renderer.js"
import { RenderingObjectBuilder } from './RenderingObjectBuilder.js'

export type CameraSetupParameter = {
  fov: number,
  aspect: number,
  near: number,
  far: number
}

export interface ObjectFactory<T> {
  makeRenderer: (cameraParameter: CameraSetupParameter) => Renderer<T>
  makeRenderingObjectBuilder: () => RenderingObjectBuilder<T>
}
