import * as THREE from 'three'

const camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.001, 10 )
camera.y = 1

//
// Setup scene
// -----------------------------------------------------------

const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 )
const material = new THREE.MeshNormalMaterial()
const mesh = new THREE.Mesh( geometry, material )
const light = new THREE.AmbientLight( 0x404040 )

const scene = new THREE.Scene()
scene.add(light)
scene.add(mesh)

//
// Setup renderer
// -----------------------------------------------------------

const renderer = new THREE.WebGLRenderer( { antialias: true } )
renderer.setSize( window.innerWidth, window.innerHeight )
document.body.appendChild( renderer.domElement )
renderer.setAnimationLoop(time => {
  renderer.render( scene, camera )
})

//
// Camera control
// -----------------------------------------------------------

let previousMousePointer = null
let dist = 2
let rot = [0, 0]

const setCameraPosition = () => {
  camera.position.x = dist * Math.cos(rot[0]) * Math.cos(rot[1])
  camera.position.y = dist * Math.sin(rot[0])
  camera.position.z = dist * Math.cos(rot[0]) * Math.sin(rot[1])
  camera.lookAt(0, 0, 0)
}

// initialize camera position
setCameraPosition()

window.addEventListener('mousedown', e => {
  previousMousePointer = [e.screenX, e.screenY]
})

window.addEventListener('mousemove', e => {
  if (!previousMousePointer) return
  const dx = (previousMousePointer[0] - e.screenX) * 0.01
  const dy = (previousMousePointer[1] - e.screenY) * 0.01

  rot[1] += dx
  rot[0] += dy

  setCameraPosition()

  previousMousePointer = [e.screenX, e.screenY]
})

window.addEventListener('mousewheel', e => {
  dist += e.deltaY * 0.001

  setCameraPosition()
})

window.addEventListener('mouseup', () => {
  previousMousePointer = null
})

