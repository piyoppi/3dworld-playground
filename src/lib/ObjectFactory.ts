import { Camera } from './Camera.js'
import { Scene } from './Scene.js'
import { Renderer } from "./Renderer.js"
import { RenderingObjectBuilder } from './RenderingObjectBuilder.js'
import { RenderingObject } from './RenderingObject.js'

export type CameraSetupParameter = {
  fov: number,
  aspect: number,
  near: number,
  far: number
}

export interface ObjectFactory<T extends RenderingObject<T>> {
  makeRenderer: (cameraParameter: CameraSetupParameter) => Renderer<T>
  makeRenderingObjectBuilder: () => RenderingObjectBuilder<T>
}
