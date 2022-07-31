import { LookAtCameraHandler } from '../lib/LookAtCameraHandler.js'
import { loadGlb } from '../lib/threeAdapter/ThreeLoaderHelper.js'
import { extractItemsFromThreeBones } from '../lib/threeAdapter/ThreeBonePointExtractor.js'
import { MouseHandler } from '../lib/MouseHandler.js'
import { makeItem } from '../lib/ItemFactory.js'
import { ThreeFactory as Factory } from '../lib/threeAdapter/ThreeFactory.js'
import { Coordinate } from '../lib/Coordinate.js'
import { Raycaster, ItemRaycaster } from '../lib/Raycaster.js'
import { makeMarker } from '../lib/VectorMarker.js'
import { BoxColider } from '../lib/Colider.js'
import { setRenderer } from '../lib/Debugger.js'
import { AxisMarker } from '../lib/AxisMarker.js'
import { ThreeRenderingObject } from '../lib/threeAdapter/ThreeRenderer.js'
import { Item } from '../lib/Item.js'

const lookAtCameraHandler = new LookAtCameraHandler()
const mouseHandler = new MouseHandler(window.innerWidth, window.innerHeight)
const factory = new Factory()
const renderer = factory.makeRenderer({fov: 100, aspect: window.innerWidth / window.innerHeight, near: 0.001, far: 10})
renderer.initialize(window.innerWidth, window.innerHeight)

setRenderer(renderer)

const raycaster = new ItemRaycaster<Item>(new Raycaster(renderer.camera))

async function run() {
  const lightCoordinate = new Coordinate()
  lightCoordinate.y = 1
  lightCoordinate.lookAt([0, 0, 0])
  renderer.addLight(lightCoordinate)

  const avatarRenderingObject = await loadGlb('./assets/avatar.glb')
  const avatar = makeItem()
  avatar.parentCoordinate.z = 0
  avatar.parentCoordinate.y = -1
  renderer.addItem(avatar, {item: avatarRenderingObject})

  const marker = new AxisMarker<ThreeRenderingObject>()

  setTimeout(() => {
    const bones = extractItemsFromThreeBones(avatarRenderingObject, avatar)
    bones.forEach(bone => renderer.addItem(bone.item, bone.renderingObject))
    bones.forEach(bone => {
      const colider = new BoxColider(0.03, 0.03, 0.03, bone.item.parentCoordinate)  
      raycaster.addTarget(colider, bone.item)
    })

    const primitiveRenderingObjectBuilder = factory.makeRenderingObjectBuilder()
    marker.setParentCoordinate(bones[2].item.parentCoordinate)
    marker.attachRenderingObject(primitiveRenderingObjectBuilder, renderer)
  }, 50)

  //
  // Setup renderer
  // -----------------------------------------------------------

  renderer.setRenderingLoop(() => {
    if (mouseHandler.updated) {
      const pos = mouseHandler.getNormalizedPosition()

      // debug
      // const ray = raycaster.getRay(pos[0], pos[1])
      // const markerItem = makeMarker(ray.position, ray.direction)
      // renderer.addItem(
      //   markerItem,
      //   primitiveRenderingObjectBuilder.makeVectorRenderingObject(5)
      // )

      // raycast
      const items = raycaster.check(pos[0], pos[1])
      items.forEach(item => renderer.setColor(item, {r: 255, g: 255, b: 0}))

      if (items.length > 0) {
        marker.setParentCoordinate(items[0].parentCoordinate)
      }
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
