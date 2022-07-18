import { Group } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export const loadGlb = (url: string): Promise<Group> => {
  const loader = new GLTFLoader()

  return new Promise((resolve, reject) => {
    loader.load(url, gltf => resolve(gltf.scene), undefined, e => reject(e))
  })
}
