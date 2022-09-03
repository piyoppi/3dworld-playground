import { LookAtCameraHandler } from '../lib/LookAtCameraHandler.js'
import { MouseCapturer } from '../lib/mouse/MouseCapturer.js'
import { ThreeFactory as Factory } from '../lib/threeAdapter/ThreeFactory.js'
import { Coordinate } from '../lib/Coordinate.js'
import { Raycaster, ItemRaycaster } from '../lib/Raycaster.js'
import { DirectionalMarker } from '../lib/markers/DirectionalMarker.js'
import { ThreeRenderingObject } from '../lib/threeAdapter/ThreeRenderer.js'
import { Item } from '../lib/Item.js'
import { DirectionalMoveHandler } from '../lib/mouse/handlers/DirectionalMoveHandler.js'
import { MouseHandlers } from '../lib/mouse/MouseHandlers.js'
import { CameraKeyboardHandler } from '../lib/CameraKeyboardHandler.js'
import { BoxColider } from '../lib/Colider.js'
import { convertButtonNumberToMouseButtonsType } from "../lib/mouse/ConvertMouseButtonIdToMouseButtonType.js"
import { Raycasters } from '../lib/Raycasters.js'

const lookAtCameraHandler = new LookAtCameraHandler()
const cameraKeyBoardHandler = new CameraKeyboardHandler()
cameraKeyBoardHandler.setLookAtCameraHandler(lookAtCameraHandler)
cameraKeyBoardHandler.capture()

const mouseHandler = new MouseCapturer(window.innerWidth, window.innerHeight)
mouseHandler.capture()

const factory = new Factory()
const renderer = factory.makeRenderer({fov: 100, aspect: window.innerWidth / window.innerHeight, near: 0.001, far: 10})
const primitiveRenderingObjectBuilder = factory.makeRenderingObjectBuilder()
renderer.initialize(window.innerWidth, window.innerHeight)

const raycaster = new ItemRaycaster<Item>(new Raycaster(renderer.camera))
const axesRaycaster = new Raycaster(renderer.camera)
const raycasters = new Raycasters()
raycasters.add(axesRaycaster)
const mouseInteractionHandler = new MouseHandlers(renderer.camera, raycasters)

const lightCoordinate = new Coordinate()
lightCoordinate.y = 1
lightCoordinate.lookAt([0, 0, 0])
renderer.addLight(lightCoordinate)

for (let x = -3; x < 3; x+=0.2) {
  for (let y = -3; y < 3; y+=0.2) {
    const box = new Item()
    const colider = new BoxColider(0.1, 0.1, 0.1, box.parentCoordinate)
    const boxRenderingObject = primitiveRenderingObjectBuilder.makeBox(0.1, 0.1, 0.1, {r: x * 50, g: y * 50, b: (x + y) * 30})
    box.parentCoordinate.x = x
    box.parentCoordinate.y = y

    renderer.addItem(box.parentCoordinate, boxRenderingObject)
    raycaster.addTarget(colider, box)
  }
}

const markerX = new DirectionalMarker(0.1, 0.01, [1, 0, 0])
const markerY = new DirectionalMarker(0.1, 0.01, [0, 1, 0])
const markerZ = new DirectionalMarker(0.1, 0.01, [0, 0, 1])

markerX.attachRenderingObject({r: 255, g: 0, b: 0}, primitiveRenderingObjectBuilder, renderer)
markerY.attachRenderingObject({r: 0, g: 255, b: 0}, primitiveRenderingObjectBuilder, renderer)
markerZ.attachRenderingObject({r: 0, g: 0, b: 255}, primitiveRenderingObjectBuilder, renderer)

function captureMouseClicked() {
  if (!mouseHandler.updated) return
  const pos = mouseHandler.getNormalizedPosition()

  raycaster.check(pos[0], pos[1])
  axesRaycaster.check(pos[0], pos[1])

  if (axesRaycaster.colidedColiders.length === 0 && raycaster.colidedItems.length > 0) {
    const box = raycaster.colidedItems[0]
    markerX.setParentCoordinate(box.parentCoordinate)
    markerY.setParentCoordinate(box.parentCoordinate)
    markerZ.setParentCoordinate(box.parentCoordinate)
    markerX.detach(axesRaycaster, mouseInteractionHandler)
    markerY.detach(axesRaycaster, mouseInteractionHandler)
    markerZ.detach(axesRaycaster, mouseInteractionHandler)
    markerX.setHandler(new DirectionalMoveHandler(box.parentCoordinate, [1, 0, 0], 0.01))
    markerY.setHandler(new DirectionalMoveHandler(box.parentCoordinate, [0, 1, 0], 0.01))
    markerZ.setHandler(new DirectionalMoveHandler(box.parentCoordinate, [0, 0, 1], 0.01))
    markerX.attach(axesRaycaster, mouseInteractionHandler)
    markerY.attach(axesRaycaster, mouseInteractionHandler)
    markerZ.attach(axesRaycaster, mouseInteractionHandler)
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
  const button = convertButtonNumberToMouseButtonsType(e.button)
  lookAtCameraHandler.start(e.screenX, e.screenY, button, renderer.camera.coordinate)
  captureMouseClicked()
  mouseInteractionHandler.start(e.screenX, e.screenY, e.button)
})
window.addEventListener('mousemove', e => {
  const button = convertButtonNumberToMouseButtonsType(e.button)
  mouseInteractionHandler.move(e.screenX, e.screenY, e.button)
  lookAtCameraHandler.isLocked = mouseInteractionHandler.handling
  lookAtCameraHandler.move(e.screenX, e.screenY, button, renderer.camera.coordinate)
})
window.addEventListener('wheel', e => {
  lookAtCameraHandler.addDistance(e.deltaY * 0.001)
})
window.addEventListener('mouseup', e => {
  lookAtCameraHandler.end()
  mouseInteractionHandler.end()
})
