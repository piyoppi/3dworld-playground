import * as THREE from 'three'
import { LookAtCameraHandler } from './LookAtCameraHandler.js'
import { updateFromMatrix } from './ThreeMatrixHelper.js'
import { loadGlb } from './ThreeLoaderHelper.js'
import { getMeshes, getBones } from './ThreeObjectSelectorHelper.js'
import { extractItemsFromThreeBones } from './ThreeBonePointExtractor.js'
import { Raycaster } from './Raycaster.js'
import { MouseHandler } from './MouseHandler.js'
import { Renderer } from './Renderer.js'
import { Camera } from './Camera.js'
import { Scene } from './Scene.js'
import { RenderingObject } from './RenderingObject.js'
import { Item } from './Item.js'

const camera = new Camera(100, window.innerWidth / window.innerHeight, 0.001, 10)
const lookAtCameraHandler = new LookAtCameraHandler()
const mouseHandler = new MouseHandler(window.innerWidth, window.innerHeight)
const scene = new Scene()

const renderer = new Renderer(scene, camera)
renderer.initialize(window.innerWidth, window.innerHeight)

const raycaster = new Raycaster()
raycaster.setCamera(camera)

const makeBoudingMesh = obj => new THREE.BoundingBoxHelper( obj, 0xffffffff )

async function run() {
  const light = new THREE.AmbientLight( 0x404040, 4 )

  light.lookAt(0, 0, 0)
  const lightRenderingObject = new RenderingObject(light)
  scene.add(lightRenderingObject)

  const gltf = await loadGlb('../../assets/avatar.glb')
  const avatar = new Item()
  avatar.renderingObject = new RenderingObject(gltf.scene)
  avatar.coordinate.z = 0
  avatar.coordinate.y = -1
  renderer.scene.add(avatar.renderingObject)

  setTimeout(() => {
    const bones = extractItemsFromThreeBones(avatar)
  }, 0)

  //
  // Setup renderer
  // -----------------------------------------------------------
  renderer.setRenderingLoop(time => {
    if (mouseHandler.updated) {
      const pos = mouseHandler.getNormalizedPosition()
      //raycaster.getObjects(pos[0], pos[1]).forEach(intersect => intersect.object.material.color.set(0xFF0000))
    }

    if (lookAtCameraHandler.changed) {
      updateFromMatrix(camera.raw, lookAtCameraHandler.getLookAtMatrix())
    }
  })
  renderer.mount()

  window.addEventListener('resize', () => renderer.resize(window.innerWidth, window.innerHeight))
  window.addEventListener('click', e => mouseHandler.setPosition(e.clientX, e.clientY))
  window.addEventListener('mousedown', e => lookAtCameraHandler.start(e.screenX, e.screenY))
  window.addEventListener('mousemove', e => lookAtCameraHandler.move(e.screenX, e.screenY))
  window.addEventListener('mousewheel', e => lookAtCameraHandler.addDistance(e.deltaY * 0.001))
  window.addEventListener('mouseup', () => lookAtCameraHandler.end())
}

run()
