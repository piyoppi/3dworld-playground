import * as THREE from 'three'
import { LookAtCameraHandler } from './LookAtCameraHandler.js'
import { updateFromMatrix } from './ThreeMatrixHelper.js'
import { loadGlb } from './ThreeLoaderHelper.js'
import { getMeshes, getBones } from './ThreeObjectSelectorHelper.js'
import { resizeRenderer } from './ThreeRendererHelper.js'
import { Raycaster } from './Raycaster.js'
import { MouseHandler } from './MouseHandler.js'

const camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.001, 10 )
const lookAtCameraHandler = new LookAtCameraHandler()
const mouseHandler = new MouseHandler(window.innerWidth, window.innerHeight)

const renderer = new THREE.WebGLRenderer( { antialias: true } )
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.setPixelRatio( window.devicePixelRatio );

const raycaster = new Raycaster()
raycaster.setCamera(camera)

const makeBoudingMesh = obj => new THREE.BoundingBoxHelper( obj, 0xffffffff )

const makeBoneMesh = (obj, scene) => {
  const geometry = new THREE.SphereGeometry(
    0.03,
    5,
    5
  )
  const material = new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff}) 
  const mesh = new THREE.Mesh(geometry, material)
  mesh.material.depthTest = false

  const mat = transformMatrixFrom3dObj(obj, scene)
  mesh.applyMatrix4(mat)

  return mesh
}

const transformMatrixFrom3dObj = (ref, root, mat = ref.matrix.clone()) => {
  if (root.uuid === ref.parent.uuid) return mat
  const calcmat = mat.premultiply(ref.parent.matrix.clone())
  return transformMatrixFrom3dObj(ref.parent, root, calcmat.clone())
}

const makeWireframeLines = obj => {
  const wireframes = getMeshes(obj).map(mesh => new THREE.WireframeGeometry(mesh.geometry))
  return wireframes.map(wireframe => {
    const line = new THREE.LineSegments(wireframe)
    line.material.depthTest = false
    line.material.opacity = 0.25
    line.material.transparent = true

    return line
  })
}

async function run() {
  const scene = new THREE.Scene()
  const light = new THREE.AmbientLight( 0x404040, 4 )

  light.lookAt(0, 0, 0)
  scene.add(light)

  const gltf = await loadGlb('../../assets/avatar.glb')

  scene.add( gltf.scene )
  makeWireframeLines(gltf.scene).forEach(line => gltf.scene.add(line))

  gltf.scene.position.z = 0
  gltf.scene.position.y = -1

  const meshes = getMeshes(gltf.scene)
  const bones = getBones(gltf.scene)

  meshes.forEach(mesh => mesh.geometry.boundingSphere.radius = 1)
  meshes.map(mesh => makeBoudingMesh(mesh)).forEach(mesh => gltf.scene.add(mesh))

  setTimeout(() => {
    const boneMeshes = bones.map(bone => makeBoneMesh(bone, gltf.scene))
    boneMeshes.forEach(mesh => gltf.scene.add(mesh))
    raycaster.setTargets(boneMeshes)
  }, 0)

  //
  // Setup renderer
  // -----------------------------------------------------------
  renderer.setAnimationLoop(time => {
    if (mouseHandler.updated) {
      const pos = mouseHandler.getNormalizedPosition()
      raycaster.getObjects(pos[0], pos[1]).forEach(intersect => intersect.object.material.color.set(0xFF0000))
    }

    if (lookAtCameraHandler.changed) {
      updateFromMatrix(camera, lookAtCameraHandler.getLookAtMatrix())
    }

    renderer.render( scene, camera )
  })
  document.body.appendChild( renderer.domElement )

  window.addEventListener('resize', () => resizeRenderer(camera))
  window.addEventListener('click', e => mouseHandler.setPosition(e.clientX, e.clientY))
  window.addEventListener('mousedown', e => lookAtCameraHandler.start(e.screenX, e.screenY))
  window.addEventListener('mousemove', e => lookAtCameraHandler.move(e.screenX, e.screenY))
  window.addEventListener('mousewheel', e => lookAtCameraHandler.distance += e.deltaY * 0.001)
  window.addEventListener('mouseup', () => lookAtCameraHandler.end())
}

run()
