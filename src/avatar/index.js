import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

function loadGlb(url) {
  const loader = new GLTFLoader()

  return new Promise((resolve, reject) => {
    loader.load(url, gltf => resolve(gltf), undefined, e => reject(e))
  })
}

async function run() {
  const camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.001, 10 )
  camera.y = 1

  const scene = new THREE.Scene()
  const light = new THREE.AmbientLight( 0x404040, 4 )
  light.lookAt(0, 0, 0)
  scene.add(light)

  const renderer = new THREE.WebGLRenderer( { antialias: true } )
  renderer.setSize( window.innerWidth, window.innerHeight )

  const getMeshes = (obj) => {
    return [
      ...obj.children.filter(child => child.isMesh),
      ...obj.children.map(child => getMeshes(child)).flat(),
    ]
  }

  const makeBoudingMesh = (obj) => {
    return new THREE.BoundingBoxHelper( obj, 0xffffffff );
  }

  const gltf = await loadGlb('../../assets/avatar.glb')

  scene.add( gltf.scene )
  gltf.scene.position.z = 0
  gltf.scene.position.y = -1

  const meshes = getMeshes(gltf.scene)
  meshes.forEach(mesh => mesh.geometry.boundingSphere.radius = 1)
  meshes.map(mesh => makeBoudingMesh(mesh)).forEach(mesh => {
    gltf.scene.add(mesh)
  })

  const upperArmL = gltf.scene.getObjectByName('UpperArmL')

  renderer.setAnimationLoop(time => {
    renderer.render( scene, camera )
  })
  document.body.appendChild( renderer.domElement )
  document.body.appendChild( VRButton.createButton( renderer ) )

  //
  // UI
  // -----------------------------------------------------------
  const form = document.getElementById('InputForm')
  const sliderX = document.getElementById('UpperArmL_RotateX')
  const sliderY = document.getElementById('UpperArmL_RotateY')
  const sliderZ = document.getElementById('UpperArmL_RotateZ')

  form.addEventListener('mousedown', e => e.stopPropagation())

  sliderX.addEventListener('input', e => {
    upperArmL.rotation.x = e.target.value / 100.0
  })
  sliderY.addEventListener('input', e => {
    upperArmL.rotation.y = e.target.value / 100.0
  })
  sliderZ.addEventListener('input', e => {
    upperArmL.rotation.z = e.target.value / 100.0
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
}

run()
