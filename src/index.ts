import { LookAtCameraHandler } from './LookAtCameraHandler.js'
import { loadGlb } from './threeAdapter/ThreeLoaderHelper.js'
import { extractItemsFromThreeBones } from './threeAdapter/ThreeBonePointExtractor.js'
import { MouseHandler } from './MouseHandler.js'
import { makeItem } from './ItemFactory.js'
import { ThreeFactory as Factory } from './threeAdapter/ThreeFactory.js'
import { Coordinate } from './Coordinate.js'
import { Raycaster } from './Raycaster.js'
import { makeMarker } from './VectorMarker.js'
import { Item } from './Item.js'
import { BoxGeometry, MeshBasicMaterial } from 'three'
import { BallColider } from './Colider.js'
import { setRenderer } from './Debugger.js'

const lookAtCameraHandler = new LookAtCameraHandler()
const mouseHandler = new MouseHandler(window.innerWidth, window.innerHeight)
const factory = new Factory()
const renderer = factory.makeRenderer({fov: 100, aspect: window.innerWidth / window.innerHeight, near: 0.001, far: 10})
renderer.initialize(window.innerWidth, window.innerHeight)

setRenderer(renderer)

const raycaster = new Raycaster(renderer.camera)

async function run() {
  const lightCoordinate = new Coordinate()
  lightCoordinate.y = 1
  lightCoordinate.lookAt([0, 0, 0])
  renderer.addLight(lightCoordinate)

  const avatarRenderingObject = await loadGlb('../../assets/avatar.glb')
  const avatar = makeItem()
  avatar.parentCoordinate.z = 0
  avatar.parentCoordinate.y = -1
  renderer.addItem(avatar, {item: avatarRenderingObject})

  setTimeout(() => {
    const bones = extractItemsFromThreeBones(avatarRenderingObject, avatar)
    bones.forEach(bone => renderer.addItem(bone.item, bone.renderingObject))
    bones.forEach(bone => {
      const colider = new BallColider(0.03, bone.item.parentCoordinate)  
      bone.item.addColider(colider)
    })
    bones.forEach(bone => raycaster.addTarget(bone.item))
  }, 50)

  //
  // Setup renderer
  // -----------------------------------------------------------
  renderer.setRenderingLoop(() => {
    if (mouseHandler.updated) {
      const pos = mouseHandler.getNormalizedPosition()

      // debug
      //const ray = raycaster.getRay(pos[0], pos[1])
      //const markerItem = makeMarker(ray.position, ray.direction)
      //renderer.addItem(
      //  markerItem,
      //  factory.makeVectorMarkerRenderingObject(5, markerItem)
      //)

      // raycast
      const items = raycaster.check(pos[0], pos[1])
      console.log(items)
      items.forEach(item => renderer.setColor(item, {r: 255, g: 0, b: 0}))
    }

    if (lookAtCameraHandler.changed) {
      renderer.camera.coordinate.matrix = lookAtCameraHandler.getLookAtMatrix()
    }
    renderer.render()
  })
  renderer.mount()

  window.addEventListener('resize', () => renderer.resize(window.innerWidth, window.innerHeight))
  window.addEventListener('click', e => mouseHandler.setPosition(e.clientX, e.clientY))
  window.addEventListener('mousedown', e => lookAtCameraHandler.start(e.screenX, e.screenY))
  window.addEventListener('mousemove', e => lookAtCameraHandler.move(e.screenX, e.screenY))
  window.addEventListener('wheel', e => lookAtCameraHandler.addDistance(e.deltaY * 0.001))
  window.addEventListener('mouseup', () => lookAtCameraHandler.end())
}

run()
