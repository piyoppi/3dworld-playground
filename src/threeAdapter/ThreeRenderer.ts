import { WebGLRenderer, Scene, BufferGeometry, Material, Mesh, AmbientLight, Object3D, Group } from 'three'
import { Renderer } from '../Renderer.js'
import { ThreeCamera } from './ThreeCamera.js'
import { Item } from '../Item.js'
import { Coordinate } from '../Coordinate.js'
import { syncCoordinate } from './ThreeSyncCoordinate.js'

type ThreePrimitiveRenderingObject = {
  geometry: BufferGeometry,
  material: Material
}

export type ThreeRenderingObject = {
  item: ThreePrimitiveRenderingObject | Scene | Group
}

export class ThreeRenderer implements Renderer<ThreeRenderingObject> {
  #renderer: WebGLRenderer
  #scene: Scene
  #camera: ThreeCamera

  constructor(scene: Scene, camera: ThreeCamera) {
    this.#renderer = new WebGLRenderer({ antialias: true })
    this.#scene = scene
    this.#camera = camera
  }

  get camera() {
    return this.#camera
  }

  initialize(width: number, height: number) {
    this.#renderer.setSize(width, height)
    this.#renderer.setPixelRatio( window.devicePixelRatio )
  }

  addItem(item: Item, renderingObject: ThreeRenderingObject) {
    if (renderingObject.item instanceof Scene || renderingObject.item instanceof Group) {
      this.#scene.add(renderingObject.item)
      syncCoordinate(item.parentCoordinate, renderingObject.item)
    } else if (renderingObject.item.geometry && renderingObject.item.material) {
      const mesh = new Mesh(renderingObject.item.geometry, renderingObject.item.material)
      this.#scene.add(mesh)
      syncCoordinate(item.parentCoordinate, mesh)
    }
  }

  addLight(coordinate: Coordinate) {
    const light = new AmbientLight( 0x404040, 4 )
    this.#scene.add(light)
    syncCoordinate(coordinate, light)
  }

  render() {
    this.#renderer.render(this.#scene, this.#camera.raw)
  }

  setRenderingLoop(callable: () => void) {
    this.#renderer.setAnimationLoop(() => {
      callable()
      this.render()
    })
  }

  mount() {
    document.body.appendChild( this.#renderer.domElement )
  }

  resize(width: number, height: number) {
    this.#camera.setAspect(width / height)
    this.#renderer.setSize(width, height)
  }
}
