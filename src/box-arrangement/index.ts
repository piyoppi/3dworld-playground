import { LookAtCameraHandler } from '../lib/LookAtCameraHandler.js'
import { MouseHandler } from '../lib/MouseHandler.js'
import { ThreeFactory as Factory } from '../lib/threeAdapter/ThreeFactory.js'
import { Coordinate } from '../lib/Coordinate.js'
import { Raycaster, ItemRaycaster } from '../lib/Raycaster.js'
import { AxisMarker } from '../lib/markers/AxisMarker.js'
import { ThreeRenderingObject } from '../lib/threeAdapter/ThreeRenderer.js'
import { Item } from '../lib/Item.js'
import { AxisMarkerHandler } from '../lib/markers/handlers/AxisMarkerHandler.js'
import { MouseInteractionHandler } from '../lib/MouseInteractionHandler.js'
import { CameraKeyboardHandler } from '../lib/CameraKeyboardHandler.js'
import { BoxColider } from '../lib/Colider.js'

const lookAtCameraHandler = new LookAtCameraHandler()
const cameraKeyBoardHandler = new CameraKeyboardHandler()
cameraKeyBoardHandler.setLookAtCameraHandler(lookAtCameraHandler)
cameraKeyBoardHandler.capture()

const mouseHandler = new MouseHandler(window.innerWidth, window.innerHeight)
mouseHandler.capture()

const factory = new Factory()
const renderer = factory.makeRenderer({fov: 100, aspect: window.innerWidth / window.innerHeight, near: 0.001, far: 10})
const primitiveRenderingObjectBuilder = factory.makeRenderingObjectBuilder()
renderer.initialize(window.innerWidth, window.innerHeight)

const raycaster = new ItemRaycaster<Item>(new Raycaster(renderer.camera))
const axesRaycaster = new Raycaster(renderer.camera)
const mouseInteractionHandler = new MouseInteractionHandler()
mouseInteractionHandler.addRaycaster(axesRaycaster)

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

    renderer.addItem(box, boxRenderingObject)
    raycaster.addTarget(colider, box)
  }
}

const marker = new AxisMarker<ThreeRenderingObject>(0.1, 0.01)
marker.attachRenderingObject(primitiveRenderingObjectBuilder, renderer)

function captureMouseClicked() {
  if (!mouseHandler.updated) return
  const pos = mouseHandler.getNormalizedPosition()

  raycaster.check(pos[0], pos[1])
  axesRaycaster.check(pos[0], pos[1])

  if (axesRaycaster.colidedColiders.length === 0 && raycaster.colidedItems.length > 0) {
    const box = raycaster.colidedItems[0]
    marker.setParentCoordinate(box.parentCoordinate)
    marker.setColider(
      axesRaycaster,
      mouseInteractionHandler,
      [
        new AxisMarkerHandler(box, [1, 0, 0], 0.01, renderer.camera),
        new AxisMarkerHandler(box, [0, 1, 0], 0.01, renderer.camera),
        new AxisMarkerHandler(box, [0, 0, 1], 0.01, renderer.camera),
      ]
    )
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
  lookAtCameraHandler.addDistance(e.deltaY * 0.001)
})
window.addEventListener('mouseup', e => {
  lookAtCameraHandler.end()
  mouseInteractionHandler.mouseup(e.screenX, e.screenY)
})
