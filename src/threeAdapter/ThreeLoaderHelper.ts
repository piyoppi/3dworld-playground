import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ThreeRenderingObject } from './ThreeRenderer.js'

export const loadGlb = (url: string): Promise<ThreeRenderingObject> => {
  const loader = new GLTFLoader()

  return new Promise((resolve, reject) => {
    loader.load(url, gltf => resolve({item: gltf.scene}), undefined, e => reject(e))
  })
}
