import { LookAtCameraHandler } from '../lib/LookAtCameraHandler.js'
import { MouseHandler } from '../lib/mouse/MouseHandler.js'
import { ThreeFactory as Factory } from '../lib/threeAdapter/ThreeFactory.js'
import { Coordinate } from '../lib/Coordinate.js'
import { Raycaster, ItemRaycaster } from '../lib/Raycaster.js'
import { attachAxisMarkerToItem, AxisMarker } from '../lib/markers/AxisMarker.js'
import { ThreeRenderingObject } from '../lib/threeAdapter/ThreeRenderer.js'
import { Item } from '../lib/Item.js'
import { MouseInteractionHandler } from '../lib/mouse/MouseInteractionHandler.js'
import { CameraKeyboardHandler } from '../lib/CameraKeyboardHandler.js'
import { BoxColider } from '../lib/Colider.js'
import { loadGlb } from '../lib/threeAdapter/ThreeLoaderHelper.js'
import { attachCenterMarkerToItem, CenterMarker } from '../lib/markers/CenterMarker.js'
import { GridAlignment } from '../lib/markers/handlers/GridAlignment.js'

const lookAtCameraHandler = new LookAtCameraHandler()
const cameraKeyBoardHandler = new CameraKeyboardHandler()
cameraKeyBoardHandler.setLookAtCameraHandler(lookAtCameraHandler)
cameraKeyBoardHandler.capture()

const mouseHandler = new MouseHandler(window.innerWidth, window.innerHeight)
mouseHandler.capture()

const factory = new Factory()
const renderer = factory.makeRenderer({fov: 100, aspect: window.innerWidth / window.innerHeight, near: 0.001, far: 100})
const primitiveRenderingObjectBuilder = factory.makeRenderingObjectBuilder()
renderer.initialize(window.innerWidth, window.innerHeight)

const raycaster = new ItemRaycaster<Item>(new Raycaster(renderer.camera))
const axesRaycaster = new Raycaster(renderer.camera)
const centerMarkerRaycaster = new Raycaster(renderer.camera)
const mouseInteractionHandler = new MouseInteractionHandler()
mouseInteractionHandler.addRaycaster(axesRaycaster)
mouseInteractionHandler.addRaycaster(centerMarkerRaycaster)

const lightCoordinate = new Coordinate()
lightCoordinate.y = 1
lightCoordinate.lookAt([0, 0, 0])
renderer.addLight(lightCoordinate)

for (let i=-3; i<3; i++) {
  const road = new Item()
  const roadRenderingObj = await loadGlb('./assets/road.glb')
  renderer.addItem(road, {item: roadRenderingObj})
  road.parentCoordinate.z = i
  const colider = new BoxColider(6, 1, 0.5, road.parentCoordinate)
  raycaster.addTarget(colider, road)
}

const centerMarker = new CenterMarker(0.2)
const marker = new AxisMarker<ThreeRenderingObject>(1, 0.05)
marker.attachRenderingObject(primitiveRenderingObjectBuilder, renderer)

function captureMouseClicked() {
  if (!mouseHandler.updated) return
  const pos = mouseHandler.getNormalizedPosition()

  raycaster.check(pos[0], pos[1])
  axesRaycaster.check(pos[0], pos[1])
  centerMarkerRaycaster.check(pos[0], pos[1])

  if (!axesRaycaster.hasColided && !centerMarkerRaycaster.hasColided && raycaster.colidedItems.length > 0) {
    const box = raycaster.colidedItems[0]
    attachAxisMarkerToItem(marker, box, axesRaycaster, mouseInteractionHandler, 0.1, renderer.camera, new GridAlignment(1))

    attachCenterMarkerToItem(centerMarker, box, centerMarkerRaycaster, mouseInteractionHandler, 0.1, renderer.camera, new GridAlignment(1))
  }
}

renderer.setRenderingLoop(() => {
  if (lookAtCameraHandler.changed) {
    renderer.camera.coordinate.matrix = lookAtCameraHandler.getLookAtMatrix()
  }

  renderer.render()
})
renderer.mount()

window.addEventListener('resize', () => renderer.resize(window.innerWidth, window.innerHeight))
window.addEventListener('mousedown', e => {
  switch(e.button) {
    case 0:
      lookAtCameraHandler.setTargetPositionHandler()
      break
    case 1:
      lookAtCameraHandler.setRotationHandler()
      break
  }
  lookAtCameraHandler.start(e.screenX, e.screenY)
  captureMouseClicked()
  mouseInteractionHandler.mousedown(e.screenX, e.screenY)
})
window.addEventListener('mousemove', e => {
  mouseInteractionHandler.mousemove(e.screenX, e.screenY)
  lookAtCameraHandler.isLocked = mouseInteractionHandler.handling
  lookAtCameraHandler.move(e.screenX, e.screenY)
})
window.addEventListener('wheel', e => {
  lookAtCameraHandler.addDistance(e.deltaY * 0.01)
})
window.addEventListener('mouseup', e => {
  lookAtCameraHandler.end()
  mouseInteractionHandler.mouseup(e.screenX, e.screenY)
})
