import { WebGLRenderer, Scene, Mesh, AmbientLight, Group, GridHelper, Color } from 'three'
import { Renderer } from '../Renderer.js'
import { ThreeCamera } from './ThreeCamera.js'
import { syncCoordinate } from './ThreeSyncCoordinate.js'
import { RGBColor, convertRgbToHex } from '../helpers/color.js'
import type { Coordinate } from '../Coordinate.js'
import { MeshBasicMaterial } from 'three'
import { ThreeGroup, ThreePrimitiveRenderingObject, ThreeRenderingObject } from './ThreeRenderingObject.js'

export class ThreeRenderer implements Renderer<ThreeRenderingObject> {
  #renderer: WebGLRenderer
  #scene: Scene
  #camera: ThreeCamera
  #mapCoordinateIdToRenderingItem: Map<string, Mesh | Scene | Group>
  #pendingItems: Array<{mesh: Mesh | Scene | Group, coordinate: Coordinate}>

  constructor(scene: Scene, camera: ThreeCamera) {
    this.#renderer = new WebGLRenderer({ antialias: true })
    this.#scene = scene
    this.#camera = camera
    this.#mapCoordinateIdToRenderingItem = new Map()
    this.#pendingItems = []
    this.debug()
  }

  get camera() {
    return this.#camera
  }

  initialize(width: number, height: number) {
    this.#renderer.setSize(width, height)
    this.#renderer.setPixelRatio( window.devicePixelRatio )
  }

  addItem(coordinate: Coordinate, renderingObject: ThreeRenderingObject) {
    const mesh = (renderingObject.item instanceof ThreeGroup) ? renderingObject.item.group :
      (renderingObject.item instanceof ThreePrimitiveRenderingObject) ? new Mesh(renderingObject.item.geometry, renderingObject.item.material) :
      null

    if (!mesh) {
      throw new Error('RenderingObject is invalid.')
    }

    if (coordinate.parent) {
      const parentMesh = this.#mapCoordinateIdToRenderingItem.get(coordinate.parent.uuid)

      if (coordinate.parent.items.length === 0) {
        if (parentMesh && parentMesh instanceof Group) {
          parentMesh.add(mesh)
        } else {
          const group = new Group()
          group.add(mesh)
          this.#scene.add(group)
          this.#mapCoordinateIdToRenderingItem.set(coordinate.parent.uuid, group)
          syncCoordinate(coordinate.parent, group)
        }
      } else if (!parentMesh) {
        this.#pendingItems.push({coordinate, mesh})
      } else {
        parentMesh.add(mesh)
      }
    } else {
      this.#scene.add(mesh)
    }

    this.#pendingItems.forEach(props => {
      if (!coordinate.parent) return
      const parentMesh = this.#mapCoordinateIdToRenderingItem.get(coordinate.parent.uuid)
      if (!parentMesh) return

      parentMesh.add(props.mesh)
    })

    this.#mapCoordinateIdToRenderingItem.set(coordinate.uuid, mesh)

    coordinate.setSetChildCallback((parent, child) => this.coordinateSetChildCallbackHandler(parent, child))
    coordinate.setRemoveChildCallback((parent, child) => this.coordinateRemoveChildCallbackHandler(parent, child))
    coordinate.setUpdateCallback(() => syncCoordinate(coordinate, mesh))

    syncCoordinate(coordinate, mesh)
  }

  removeItem(coordinate: Coordinate) {
    const renderingItem = this.#mapCoordinateIdToRenderingItem.get(coordinate.uuid)
    if (!renderingItem) return

    this.#scene.remove(renderingItem)
    this.#mapCoordinateIdToRenderingItem.delete(coordinate.uuid)
  }

  private coordinateSetChildCallbackHandler(parent: Coordinate, child: Coordinate) {
    const parentMesh = this.#mapCoordinateIdToRenderingItem.get(parent.uuid)
    const childMesh = this.#mapCoordinateIdToRenderingItem.get(child.uuid)

    if (!parentMesh || !childMesh) return

    parentMesh.add(childMesh)
    syncCoordinate(child, childMesh)
  }

  private coordinateRemoveChildCallbackHandler(parent: Coordinate, child: Coordinate) {
    const parentMesh = this.#mapCoordinateIdToRenderingItem.get(parent.uuid)
    const childMesh = this.#mapCoordinateIdToRenderingItem.get(child.uuid)

    if (!parentMesh || !childMesh) return

    parentMesh.remove(childMesh)
    syncCoordinate(child, childMesh)
  }

  setColor(coordinate: Coordinate, color: RGBColor) {
    const renderingItem = this.#mapCoordinateIdToRenderingItem.get(coordinate.uuid)
    if (!renderingItem) return
    if (!(renderingItem instanceof Mesh)) return

    if (renderingItem.material instanceof MeshBasicMaterial) {
      renderingItem.material.color = new Color(convertRgbToHex(color))  
    }
  }

  private debug() {
    const size = 10
    const divisions = 10

    const gridHelper = new GridHelper(size, divisions)
    this.#scene.add(gridHelper)
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
