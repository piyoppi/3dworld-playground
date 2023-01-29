import { Quaternion } from '../lib/Quaternion.js'
import { attachCoordinateRenderingItem } from "../lib/helpers/CoordinateRenderingObject.js"
import { Mat4 } from '../lib/Matrix.js'
import { Coordinate } from '../lib/Coordinate.js'
import { ThreeRenderingObjectBuilder } from '../lib/threeAdapter/ThreeRenderingObjectBuilder.js'
import { ThreeFactory as Factory } from '../lib/threeAdapter/ThreeFactory.js'
import { CameraController } from '../lib/CameraController.js'
import { Raycasters } from '../lib/Raycasters.js'
import { MouseControlHandles } from '../lib/mouse/MouseControlHandles.js'
import { MouseCapturer } from '../lib/mouse/MouseCapturer.js'

const q1 = Quaternion.fromRotateParams(Math.PI / 2, [0, 1, 0]).normalize()
const q2 = Quaternion.fromRotateParams(Math.PI / 2, [1, 0, 0]).normalize()

const converted = Quaternion.mul(q2, q1)
console.log(converted.toEular())

const matrix = Mat4.fromMatrixArray3(converted.toMatrix())
const baseCoord = new Coordinate()
const coord = new Coordinate()
coord.setMatrix(matrix)

// for Viewer
const factory = new Factory()
const renderer = factory.makeRenderer({fov: 100, aspect: window.innerWidth / window.innerHeight, near: 0.001, far: 100})
const cameraController = new CameraController(renderer.camera)
const raycasters = new Raycasters()
const mouseControlHandles = new MouseControlHandles(renderer.camera, raycasters, window.innerWidth, window.innerHeight)
const mouseCapturer = new MouseCapturer(window.innerWidth, window.innerHeight)
mouseControlHandles.captureMouseEvent('primary')
cameraController.setMouseHandlers(mouseControlHandles)
cameraController.setDefaultMouseDownHandler(mouseControlHandles)

raycasters.add(cameraController.raycaster)
renderer.initialize(window.innerWidth, window.innerHeight)
renderer.mount()
renderer.setRenderingLoop(() => {
  const pos = mouseCapturer.getNormalizedPosition()
  raycasters.check(pos)
  cameraController.update(renderer.camera)
})

attachCoordinateRenderingItem(coord, new ThreeRenderingObjectBuilder(), renderer, 3, 0.2)
attachCoordinateRenderingItem(baseCoord, new ThreeRenderingObjectBuilder(), renderer, 3, 0.2)
