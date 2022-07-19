import { LookAtCameraHandler } from '../lib/LookAtCameraHandler.js'
import { MouseHandler } from '../lib/MouseHandler.js'
import { ThreeFactory as Factory } from '../lib/threeAdapter/ThreeFactory.js'
import { Coordinate } from '../lib/Coordinate.js'
import { Raycaster } from '../lib/Raycaster.js'
import { BoxColider } from '../lib/Colider.js'
import { setRenderer } from '../lib/Debugger.js'
import { AxisMarker } from '../lib/AxisMarker.js'
import { ThreeRenderingObject } from '../lib/threeAdapter/ThreeRenderer.js'
import { Item } from '../lib/Item.js'
import { AxisMarkerHandler } from '../lib/AxisMarkerHandler.js'
import { MouseDraggable } from '../lib/MouseDragHandler.js'

const lookAtCameraHandler = new LookAtCameraHandler()
const mouseHandler = new MouseHandler(window.innerWidth, window.innerHeight)
const factory = new Factory()
const renderer = factory.makeRenderer({fov: 100, aspect: window.innerWidth / window.innerHeight, near: 0.001, far: 10})
const primitiveRenderingObjectBuilder = factory.makeRenderingObjectBuilder()
renderer.initialize(window.innerWidth, window.innerHeight)

setRenderer(renderer)

const raycaster = new Raycaster(renderer.camera)

const lightCoordinate = new Coordinate()
lightCoordinate.y = 1
lightCoordinate.lookAt([0, 0, 0])
renderer.addLight(lightCoordinate)

const box = new Item()
const boxRenderingObject = primitiveRenderingObjectBuilder.makeBox(0.1, 0.1, 0.1, {r: 255, g: 0, b: 255})
box.addColider(new BoxColider(0.1, 0.1, 0.1, box.parentCoordinate))
renderer.addItem(box, boxRenderingObject)

const marker = new AxisMarker<ThreeRenderingObject>()
marker.attachRenderingObject(primitiveRenderingObjectBuilder, renderer)
marker.setColider(0.005)
marker.setParentCoordinate(box.parentCoordinate)
marker.axes.forEach(item => raycaster.addTarget(item))

const mouseDraggables : Array<MouseDraggable> = [
  new AxisMarkerHandler(marker.xItem, box, [1, 0, 0], 0.01, renderer.camera),
  new AxisMarkerHandler(marker.yItem, box, [0, 1, 0], 0.01, renderer.camera),
  new AxisMarkerHandler(marker.zItem, box, [0, 0, 1], 0.01, renderer.camera),
  lookAtCameraHandler
]


renderer.setRenderingLoop(() => {
  if (mouseHandler.updated) {
    const pos = mouseHandler.getNormalizedPosition()

    // raycast
    const items = raycaster.check(pos[0], pos[1])
    let axisSelected = false
    if (items.length > 0) {
      if (items[0] === marker.xItem) {
        axisSelected = true
      } else if (items[0] === marker.yItem) {
        axisSelected = true
      } else if (items[0] === marker.zItem) {
        axisSelected = true
      }
    }

    lookAtCameraHandler.isLocked = axisSelected
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

  if (raycaster.colidedItems[0] === marker.xItem) {
    mouseDraggables[0].start(e.screenX, e.screenY)
  }

  if (raycaster.colidedItems[0] === marker.yItem) {
    mouseDraggables[1].start(e.screenX, e.screenY)
  }

  if (raycaster.colidedItems[0] === marker.zItem) {
    mouseDraggables[2].start(e.screenX, e.screenY)
  }

  mouseHandler.setPosition(e.clientX, e.clientY)
})
window.addEventListener('mousemove', e => {
  mouseDraggables.forEach(handler => handler.move(e.screenX, e.screenY))
  mouseHandler.setPosition(e.clientX, e.clientY)
})
window.addEventListener('wheel', e => {
  lookAtCameraHandler.addDistance(e.deltaY * 0.001)
  mouseHandler.setPosition(e.clientX, e.clientY)
})
window.addEventListener('mouseup', () => {
  mouseDraggables.forEach(handler => handler.end())
})
