import { LookAtCameraHandler } from '../lib/LookAtCameraHandler.js'
import { MouseHandler } from '../lib/MouseHandler.js'
import { ThreeFactory as Factory } from '../lib/threeAdapter/ThreeFactory.js'
import { Coordinate } from '../lib/Coordinate.js'
import { Raycaster } from '../lib/Raycaster.js'
import { setRenderer } from '../lib/Debugger.js'
import { AxisMarker } from '../lib/AxisMarker.js'
import { ThreeRenderingObject } from '../lib/threeAdapter/ThreeRenderer.js'
import { Item } from '../lib/Item.js'
import { AxisMarkerHandler } from '../lib/AxisMarkerHandler.js'
import { MouseInteractionHandler } from '../lib/MouseInteractionHandler.js'
import { CameraKeyboardHandler } from '../lib/CameraKeyboardHandler.js'

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

setRenderer(renderer)

const raycaster = new Raycaster<Item>(renderer.camera)
const mouseInteractionHandler = new MouseInteractionHandler(raycaster)
mouseInteractionHandler.capture()

const lightCoordinate = new Coordinate()
lightCoordinate.y = 1
lightCoordinate.lookAt([0, 0, 0])
renderer.addLight(lightCoordinate)

const box = new Item()
const boxRenderingObject = primitiveRenderingObjectBuilder.makeBox(0.1, 0.1, 0.1, {r: 255, g: 0, b: 255})
renderer.addItem(box, boxRenderingObject)

const marker = new AxisMarker<ThreeRenderingObject>()
marker.attachRenderingObject(primitiveRenderingObjectBuilder, renderer)
marker.setParentCoordinate(box.parentCoordinate)
marker.setColider(
  raycaster,
  mouseInteractionHandler,
  [
    new AxisMarkerHandler(box, [1, 0, 0], 0.01, renderer.camera),
    new AxisMarkerHandler(box, [0, 1, 0], 0.01, renderer.camera),
    new AxisMarkerHandler(box, [0, 0, 1], 0.01, renderer.camera),
  ],
  0.005
)

renderer.setRenderingLoop(() => {
  if (mouseHandler.updated) {
    const pos = mouseHandler.getNormalizedPosition()

    raycaster.check(pos[0], pos[1])

    lookAtCameraHandler.isLocked = mouseInteractionHandler.handling
  }

  if (lookAtCameraHandler.changed) {
    renderer.camera.coordinate.matrix = lookAtCameraHandler.getLookAtMatrix()
  }

  renderer.render()
})
renderer.mount()

window.addEventListener('resize', () => renderer.resize(window.innerWidth, window.innerHeight))
window.addEventListener('mousedown', e => {
  lookAtCameraHandler.start(e.screenX, e.screenY)
})
window.addEventListener('mousemove', e => {
  lookAtCameraHandler.move(e.screenX, e.screenY)
})
window.addEventListener('wheel', e => {
  lookAtCameraHandler.addDistance(e.deltaY * 0.001)
})
window.addEventListener('mouseup', () => {
  lookAtCameraHandler.end()
})
