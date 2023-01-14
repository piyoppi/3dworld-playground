import { LookAtCamera } from '../lib/LookAtCamera.js'
import { loadGlb } from '../lib/threeAdapter/ThreeLoaderHelper.js'
import { extractItemsFromThreeBones } from '../lib/threeAdapter/ThreeBonePointExtractor.js'
import { MouseCapturer } from '../lib/mouse/MouseCapturer.js'
import { makeItem } from '../lib/ItemFactory.js'
import { ThreeFactory as Factory } from '../lib/threeAdapter/ThreeFactory.js'
import { Coordinate } from '../lib/Coordinate.js'
import { Raycaster } from '../lib/Raycaster.js'
import { BoxColider } from '../lib/Colider.js'
import { setRenderer } from '../lib/Debugger.js'
import { DirectionalMarker } from '../lib/markers/DirectionalMarker.js'
import { ThreeGroup, ThreeRenderingObject } from '../lib/threeAdapter/ThreeRenderingObject.js'
import { convertButtonNumberToMouseButtonsType } from '../lib/mouse/ConvertMouseButtonIdToMouseButtonType.js'

const lookAtCameraHandler = new LookAtCamera()
const mouseHandler = new MouseCapturer(window.innerWidth, window.innerHeight)
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

  const avatarRenderingObject = await loadGlb('./assets/avatar.glb')
  const avatar = makeItem()
  avatar.parentCoordinate.z = 0
  avatar.parentCoordinate.y = -1
  renderer.addItem(avatar.parentCoordinate, new ThreeRenderingObject(new ThreeGroup(avatarRenderingObject)))

  const markerX = new DirectionalMarker(0.1, 0.01, [1, 0, 0])
  const markerY = new DirectionalMarker(0.1, 0.01, [0, 1, 0])
  const markerZ = new DirectionalMarker(0.1, 0.01, [0, 0, 1])

  setTimeout(() => {
    const bones = extractItemsFromThreeBones(avatarRenderingObject, avatar)
    bones.forEach(bone => renderer.addItem(bone.item.parentCoordinate, bone.renderingObject))
    bones.forEach(bone => {
      const colider = new BoxColider(0.03, 0.03, 0.03, bone.item.parentCoordinate)  
      raycaster.addTarget(colider)
    })

    const primitiveRenderingObjectBuilder = factory.makeRenderingObjectBuilder()
    markerX.setParentCoordinate(bones[2].item.parentCoordinate)
    markerY.setParentCoordinate(bones[2].item.parentCoordinate)
    markerZ.setParentCoordinate(bones[2].item.parentCoordinate)
    markerX.attachRenderingObject({r: 255, g: 0, b: 0}, primitiveRenderingObjectBuilder, renderer)
    markerY.attachRenderingObject({r: 0, g: 255, b: 0}, primitiveRenderingObjectBuilder, renderer)
    markerZ.attachRenderingObject({r: 0, g: 0, b: 255}, primitiveRenderingObjectBuilder, renderer)
  }, 50)

  //
  // Setup renderer
  // -----------------------------------------------------------

  renderer.setRenderingLoop(() => {
    if (mouseHandler.updated) {
      const pos = mouseHandler.getNormalizedPosition()

      // raycast
      const items = raycaster.check(pos[0], pos[1])
      items.forEach(item => item.parentCoordinate && renderer.setColor(item.parentCoordinate, {r: 255, g: 255, b: 0}))

      if (items.length > 0 && items[0].parentCoordinate) {
        markerX.setParentCoordinate(items[0].parentCoordinate)
        markerY.setParentCoordinate(items[0].parentCoordinate)
        markerZ.setParentCoordinate(items[0].parentCoordinate)
      }
    }

    if (lookAtCameraHandler.changed) {
      renderer.camera.coordinate.setMatrix(lookAtCameraHandler.getLookAtMatrix())
    }
    renderer.render()
  })
  renderer.mount()

  window.addEventListener('resize', () => renderer.resize(window.innerWidth, window.innerHeight))
  window.addEventListener('click', e => mouseHandler.setPosition(e.clientX, e.clientY))
  window.addEventListener('mousedown', e => {
    lookAtCameraHandler.start(e.screenX, e.screenY)
  })
  window.addEventListener('mousemove', e => lookAtCameraHandler.move(e.screenX, e.screenY))
  window.addEventListener('wheel', e => lookAtCameraHandler.addDistance(e.deltaY * 0.001))
  window.addEventListener('mouseup', () => lookAtCameraHandler.end())
}

run()
