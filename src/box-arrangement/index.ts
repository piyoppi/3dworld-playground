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
//raycaster.addTarget(box)
renderer.addItem(box, boxRenderingObject)

const marker = new AxisMarker<ThreeRenderingObject>()
marker.attachRenderingObject(primitiveRenderingObjectBuilder, renderer)
marker.setColider(0.005).forEach(item => raycaster.addTarget(item))

renderer.setRenderingLoop(() => {
  if (mouseHandler.updated) {
    const pos = mouseHandler.getNormalizedPosition()

    // raycast
    const items = raycaster.check(pos[0], pos[1])
    console.log(items)
    if (items.length > 0) {
      if (items[0] === marker.xItem) {
        console.log('xAxis')
      }
      if (items[0] === marker.yItem) {
        console.log('yAxis')
      }
      if (items[0] === marker.zItem) {
        console.log('zAxis')
      }
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
