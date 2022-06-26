import { LookAtCameraHandler } from './LookAtCameraHandler.js'
import { loadGlb } from './threeAdapter/ThreeLoaderHelper.js'
import { extractItemsFromThreeBones } from './threeAdapter/ThreeBonePointExtractor.js'
import { MouseHandler } from './MouseHandler.js'
import { makeItem } from './ItemFactory.js'
import { ThreeFactory as Factory } from './threeAdapter/ThreeFactory.js'
import { Coordinate } from './Coordinate.js'
import { Raycaster } from './Raycaster.js'
import { Mat4 } from './Matrix.js'
import { makeMarker } from './VectorMarker.js'

const lookAtCameraHandler = new LookAtCameraHandler()
const mouseHandler = new MouseHandler(window.innerWidth, window.innerHeight)
const factory = new Factory()
const renderer = factory.makeRenderer({fov: 100, aspect: window.innerWidth / window.innerHeight, near: 0.001, far: 10})
renderer.initialize(window.innerWidth, window.innerHeight)

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
    bones.forEach(bone => raycaster.addTarget(bone.item))
  }, 0)

  //
  // Setup renderer
  // -----------------------------------------------------------
  renderer.setRenderingLoop(() => {
    if (mouseHandler.updated) {
      const pos = mouseHandler.getNormalizedPosition()

      // debug
      const ray = raycaster.getRay(pos[0], pos[1])
      const markerItem = makeMarker(ray, renderer.camera.coordinate)
      renderer.addItem(
        markerItem,
        factory.makeVectorMarkerRenderingObject(ray, markerItem)
      )
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
