import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export const loadGlb = url => {
  const loader = new GLTFLoader()

  return new Promise((resolve, reject) => {
    loader.load(url, gltf => resolve(gltf), undefined, e => reject(e))
  })
}
