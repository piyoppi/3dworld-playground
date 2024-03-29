import { LookAtCamera } from '../lib/LookAtCamera.js'
import { MouseCapturer } from '../lib/mouse/MouseCapturer.js'
import { ThreeFactory as Factory } from '../lib/threeAdapter/ThreeFactory.js'
import { Coordinate } from '../lib/Coordinate.js'
import { Raycaster } from '../lib/Raycaster.js'
import { DirectionalMarker } from '../lib/markers/DirectionalMarker.js'
import { Item } from '../lib/Item.js'
import { DirectionalMoveHandler } from '../lib/mouse/handlers/DirectionalMoveHandler.js'
import { MouseControlHandles } from '../lib/mouse/MouseControlHandles.js'
import { CameraKeyboardHandler } from '../lib/CameraKeyboardHandler.js'
import { BoxColider, CoordinatedColider } from '../lib/Colider.js'
import { Raycasters } from '../lib/Raycasters.js'
import { VectorArray3 } from '../lib/Matrix'

const lookAtCameraHandler = new LookAtCamera()
const cameraKeyBoardHandler = new CameraKeyboardHandler()
cameraKeyBoardHandler.setLookAtCameraHandler(lookAtCameraHandler)
cameraKeyBoardHandler.capture()

const mouseHandler = new MouseCapturer(window.innerWidth, window.innerHeight)
mouseHandler.capture()

const factory = new Factory()
const renderer = factory.makeRenderer({fov: 100, aspect: window.innerWidth / window.innerHeight, near: 0.001, far: 10})
const primitiveRenderingObjectBuilder = factory.makeRenderingObjectBuilder()
renderer.initialize(window.innerWidth, window.innerHeight)

const raycaster = new Raycaster<CoordinatedColider>(renderer.camera)
const axesRaycaster = new Raycaster(renderer.camera)
const raycasters = new Raycasters()
raycasters.add(axesRaycaster)
const mouseInteractionHandler = new MouseControlHandles(renderer.camera, raycasters, window.innerWidth, window.innerHeight)

let markerHandlers: {marker: DirectionalMarker, remove: () => void}[] = []
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
    raycaster.addTarget(colider)
  }
}

function captureMouseClicked() {
  if (!mouseHandler.updated) return
  const pos = mouseHandler.getNormalizedPosition()

  raycaster.check(pos[0], pos[1])
  axesRaycaster.check(pos[0], pos[1])

  if (axesRaycaster.colidedColiders.length === 0 && raycaster.colidedColiders.length > 0) {
    const box = raycaster.colidedColiders[0]

    markerHandlers.forEach(({marker, remove}) => {
      remove()
      marker.detach(raycaster, mouseInteractionHandler)
    })

    markerHandlers = [
      {color: {r: 255, g: 0,   b: 0  }, axis: [1, 0, 0] as VectorArray3},
      {color: {r: 0,   g: 255, b: 0  }, axis: [0, 1, 0] as VectorArray3},
      {color: {r: 0,   g: 0,   b: 255}, axis: [0, 0, 1] as VectorArray3}
    ].map(({color, axis}) => {
      const marker = new DirectionalMarker(0.1, 0.01, axis, box.parentCoordinate)

      return {marker, axis, color}
    }).map(({marker, axis, color}) => {
      marker.setRenderingParameters({color})
      const remove = marker.attachRenderingObjects(primitiveRenderingObjectBuilder, renderer)

      marker.addHandler(new DirectionalMoveHandler(box.parentCoordinate, axis, 0.01))
      marker.attach(axesRaycaster, mouseInteractionHandler)

      return {marker, remove}
    })
  }
}

renderer.setRenderingLoop(() => {
  if (lookAtCameraHandler.changed) {
    renderer.camera.coordinate.setMatrix(lookAtCameraHandler.getLookAtMatrix())
  }

  renderer.render()
})
renderer.mount()

window.addEventListener('resize', () => renderer.resize(window.innerWidth, window.innerHeight))
window.addEventListener('mousedown', e => {
  lookAtCameraHandler.start(e.screenX, e.screenY)
  captureMouseClicked()
  mouseInteractionHandler.start(e.screenX, e.screenY, e.button)
})
window.addEventListener('mousemove', e => {
  mouseInteractionHandler.move(e.screenX, e.screenY, e.button)
  lookAtCameraHandler.isLocked = mouseInteractionHandler.handling
  lookAtCameraHandler.move(e.screenX, e.screenY)
})
window.addEventListener('wheel', e => {
  lookAtCameraHandler.addDistance(e.deltaY * 0.001)
})
window.addEventListener('mouseup', e => {
  lookAtCameraHandler.end()
  mouseInteractionHandler.end(e.clientX, e.clientY, e.button)
})
