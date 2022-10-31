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
  #mapCoordinateIdToThreeItems: Map<string, Array<Mesh | Group>>

  #mapCoordinateIdToRenderingObject : Map<string, ThreeRenderingObject> = new Map()

  constructor(scene: Scene, camera: ThreeCamera) {
    this.#renderer = new WebGLRenderer({ antialias: true })
    this.#scene = scene
    this.#camera = camera
    this.#mapCoordinateIdToThreeItems = new Map()
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
      const parentMeshes = this.threeItemFromCoordinate(coordinate.parent)

      if (parentMeshes.length === 0) {
        const group = this.makeEmptyGroupsRecursive(coordinate.parent)
        if (group) {
          group.add(mesh)
          this.registerThreeItem(coordinate, mesh)
          syncCoordinate(coordinate.parent, group)
        }
      } else {
        parentMeshes[0].add(mesh)
      }
    } else {
      this.#scene.add(mesh)
    }

    this.registerThreeItem(coordinate, mesh)

    coordinate.setSetChildCallback((parent, child) => this.coordinateSetChildCallbackHandler(parent, child))
    coordinate.setRemoveChildCallback((parent, child) => this.coordinateRemoveChildCallbackHandler(parent, child))
    coordinate.setUpdateCallback(() => syncCoordinate(coordinate, mesh))

    syncCoordinate(coordinate, mesh)

    this.#mapCoordinateIdToRenderingObject.set(coordinate.uuid, renderingObject)
  }

  removeItem(coordinate: Coordinate) {
    this.threeItemFromCoordinate(coordinate).forEach(item => {
      if (item.parent) {
        item.parent.remove(item)
      } else {
        this.#scene.remove(item)
      }

      this.#mapCoordinateIdToThreeItems.delete(coordinate.uuid)
      this.#mapCoordinateIdToRenderingObject.delete(coordinate.uuid)
    })
  }

  renderingObjectFromCoordinate(coordinate: Coordinate) {
    return this.#mapCoordinateIdToRenderingObject.get(coordinate.uuid) || null
  }

  setColor(coordinate: Coordinate, color: RGBColor) {
    this.threeItemFromCoordinate(coordinate).forEach(item => {
      if (!(item instanceof Mesh)) return

      if (item.material instanceof MeshBasicMaterial) {
        item.material.color = new Color(convertRgbToHex(color))
      }
    })
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
        const parentRenderingObjects = this.threeItemFromCoordinate(prev)

        if (parentRenderingObjects.length > 0) parentRenderingObjects[0].add(group)
      } else {
        this.#scene.add(group)
      }

      this.registerThreeItem(coord, group)

      prev = coord

      return group
    }).at(-1)
  }

  private getAllocatedRootCoordinate(coordinate: Coordinate): Coordinate | null {
    const target = coordinate.parent
    if (!target) return null

    const renderingObjects = this.threeItemFromCoordinate(target)
    if (renderingObjects.length > 0) return target

    return this.getAllocatedRootCoordinate(target)
  }

  private coordinateSetChildCallbackHandler(parent: Coordinate, child: Coordinate) {
    const parentMeshes = this.threeItemFromCoordinate(parent)
    const childMeshes = this.threeItemFromCoordinate(child)

    childMeshes.forEach(mesh => {
      parentMeshes[0].add(mesh)
      syncCoordinate(child, mesh)
    })
  }

  private coordinateRemoveChildCallbackHandler(parent: Coordinate, child: Coordinate) {
    const parentMeshes = this.threeItemFromCoordinate(parent)
    const childMeshes = this.threeItemFromCoordinate(child)

    childMeshes.forEach(mesh => mesh.parent?.remove(mesh))

    //syncCoordinate(child, childMesh)
  }

  private threeItemFromCoordinate(coordinate: Coordinate) {
    return this.#mapCoordinateIdToThreeItems.get(coordinate.uuid) || []
  }

  private registerThreeItem(coordinate: Coordinate, item: Mesh | Group) {
    const registered = this.threeItemFromCoordinate(coordinate)
    registered.push(item)

    this.#mapCoordinateIdToThreeItems.set(coordinate.uuid, registered)
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
