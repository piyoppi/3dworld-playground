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
  #mapCoordinateIdToThreeItem: Map<string, Mesh | Group>

  #mapCoordinateIdToRenderingObject : Map<string, ThreeRenderingObject> = new Map()

  constructor(scene: Scene, camera: ThreeCamera) {
    this.#renderer = new WebGLRenderer({ antialias: true })
    this.#scene = scene
    this.#camera = camera
    this.#mapCoordinateIdToThreeItem = new Map()
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
      const parentMesh = this.#mapCoordinateIdToThreeItem.get(coordinate.parent.uuid)

      //if (coordinate.parent.items.length === 0) {
      //  if (parentMesh && parentMesh instanceof Group) {
      //    parentMesh.add(mesh)
      //  } else {
      //    const group = new Group()
      //    group.add(mesh)
      //    this.#scene.add(group)
      //    this.#mapCoordinateIdToThreeItem.set(coordinate.parent.uuid, group)
      //    syncCoordinate(coordinate.parent, group)
      //  }
      if (!parentMesh) {
        const group = this.makeEmptyGroupsRecursive(coordinate.parent)
        if (group) {
          group.add(mesh)
          this.#mapCoordinateIdToThreeItem.set(coordinate.uuid, mesh)
          syncCoordinate(coordinate.parent, group)
        }
      } else {
        parentMesh.add(mesh)
      }
    } else {
      this.#scene.add(mesh)
    }

    this.#mapCoordinateIdToThreeItem.set(coordinate.uuid, mesh)

    coordinate.setSetChildCallback((parent, child) => this.coordinateSetChildCallbackHandler(parent, child))
    coordinate.setRemoveChildCallback((parent, child) => this.coordinateRemoveChildCallbackHandler(parent, child))
    coordinate.setUpdateCallback(() => syncCoordinate(coordinate, mesh))

    syncCoordinate(coordinate, mesh)

    this.#mapCoordinateIdToRenderingObject.set(coordinate.uuid, renderingObject)
  }

  removeItem(coordinate: Coordinate) {
    const renderingItem = this.#mapCoordinateIdToThreeItem.get(coordinate.uuid)
    if (!renderingItem) return

    if (renderingItem.parent) {
      renderingItem.parent.remove(renderingItem)
    } else {
      this.#scene.remove(renderingItem)
    }

    this.#mapCoordinateIdToThreeItem.delete(coordinate.uuid)
    this.#mapCoordinateIdToRenderingObject.delete(coordinate.uuid)
  }

  renderingObjectFromCoordinate(coordinate: Coordinate) {
    return this.#mapCoordinateIdToRenderingObject.get(coordinate.uuid) || null
  }

  setColor(coordinate: Coordinate, color: RGBColor) {
    const renderingItem = this.#mapCoordinateIdToThreeItem.get(coordinate.uuid)
    if (!renderingItem) return
    if (!(renderingItem instanceof Mesh)) return

    if (renderingItem.material instanceof MeshBasicMaterial) {
      renderingItem.material.color = new Color(convertRgbToHex(color))
    }
  }

  private makeEmptyGroupsRecursive(target: Coordinate) {
    const to = this.getAllocatedRootCoordinate(target)

    const coordinates: Coordinate[] = []
    const proc = (coord: Coordinate) => {
      if (coord === to) return

      coordinates.push(coord)
    }
    proc(target)

    coordinates.reverse()

    let prev = to
    return coordinates.map(coord => {
      const group = new Group()
      if (prev) {
        const parentRenderingObj = this.#mapCoordinateIdToThreeItem.get(prev.uuid)

        if (parentRenderingObj) parentRenderingObj.add(group)
      } else {
        this.#scene.add(group)
      }

      this.#mapCoordinateIdToThreeItem.set(coord.uuid, group)

      prev = coord

      return group
    }).at(-1)
  }

  private getAllocatedRootCoordinate(coordinate: Coordinate): Coordinate | null {
    const target = coordinate.parent
    if (!target) return null

    const renderingObj = this.#mapCoordinateIdToThreeItem.get(target.uuid)
    if (renderingObj) return target

    return this.getAllocatedRootCoordinate(target)
  }

  private coordinateSetChildCallbackHandler(parent: Coordinate, child: Coordinate) {
    const parentMesh = this.#mapCoordinateIdToThreeItem.get(parent.uuid)
    const childMesh = this.#mapCoordinateIdToThreeItem.get(child.uuid)

    if (!parentMesh || !childMesh) return

    parentMesh.add(childMesh)
    syncCoordinate(child, childMesh)
  }

  private coordinateRemoveChildCallbackHandler(parent: Coordinate, child: Coordinate) {
    const parentMesh = this.#mapCoordinateIdToThreeItem.get(parent.uuid)
    const childMesh = this.#mapCoordinateIdToThreeItem.get(child.uuid)

    if (!parentMesh || !childMesh) return

    parentMesh.remove(childMesh)
    syncCoordinate(child, childMesh)
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
