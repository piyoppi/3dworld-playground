import { WebGLRenderer, Scene, BufferGeometry, Material, Mesh, AmbientLight, Group, GridHelper, Color } from 'three'
import { Renderer } from '../Renderer.js'
import { ThreeCamera } from './ThreeCamera.js'
import { Item } from '../Item.js'
import { Coordinate } from '../Coordinate.js'
import { syncCoordinate } from './ThreeSyncCoordinate.js'
import { RGBColor, convertRgbToHex } from '../helpers/color.js'
import { CylinderGeometry, MeshBasicMaterial } from 'three'

export class ThreePrimitiveRenderingObject {
  #geometry: BufferGeometry
  #material: Material

  constructor(geometry: BufferGeometry, material: Material) {
    this.#geometry = geometry
    this.#material = material
  }

  get geometry() {
    return this.#geometry
  }

  get material() {
    return this.#material
  }

  clone() {
    return new ThreePrimitiveRenderingObject(this.#geometry.clone(), this.#material.clone())
  }
}

type ThreeRenderingObjectRaw = ThreePrimitiveRenderingObject | Scene | Group
export class ThreeRenderingObject {
  #item: ThreeRenderingObjectRaw

  constructor(item: ThreeRenderingObjectRaw) {
    this.#item = item
  }

  get item() {
    return this.#item
  }

  clone() {
    return new ThreeRenderingObject(this.#item.clone())
  }
}

export class ThreeRenderer implements Renderer<ThreeRenderingObject> {
  #renderer: WebGLRenderer
  #scene: Scene
  #camera: ThreeCamera
  #mapCoordinateIdToRenderingItem: Map<string, Mesh | Scene | Group>
  #mapItemIdToRenderingItem: Map<string, Mesh | Scene | Group>
  #pendingItems: Array<{mesh: Mesh | Scene | Group, item: Item}>

  constructor(scene: Scene, camera: ThreeCamera) {
    this.#renderer = new WebGLRenderer({ antialias: true })
    this.#scene = scene
    this.#camera = camera
    this.#mapCoordinateIdToRenderingItem = new Map()
    this.#mapItemIdToRenderingItem = new Map()
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

  addItem(item: Item, renderingObject: ThreeRenderingObject) {
    const mesh = (renderingObject.item instanceof Scene || renderingObject.item instanceof Group) ? renderingObject.item : new Mesh(renderingObject.item.geometry, renderingObject.item.material)

    if (item.parentCoordinate.parent) {
      const parentMesh = this.#mapCoordinateIdToRenderingItem.get(item.parentCoordinate.parent.uuid)

      if (item.parentCoordinate.parent.items.length === 0) {
        if (parentMesh && parentMesh instanceof Group) {
          parentMesh.add(mesh)
        } else {
          const group = new Group()
          group.add(mesh)
          this.#scene.add(group)
          this.#mapCoordinateIdToRenderingItem.set(item.parentCoordinate.parent.uuid, group)
          syncCoordinate(item.parentCoordinate.parent, group)
        }
      } else if (!parentMesh) {
        this.#pendingItems.push({item, mesh})
      } else {
        parentMesh.add(mesh)
      }
    } else {
      this.#scene.add(mesh)
    }

    this.#pendingItems.forEach(props => {
      if (!item.parentCoordinate.parent) return
      const parentMesh = this.#mapCoordinateIdToRenderingItem.get(item.parentCoordinate.parent.uuid)
      if (!parentMesh) return

      parentMesh.add(props.mesh)
    })

    this.#mapCoordinateIdToRenderingItem.set(item.parentCoordinate.uuid, mesh)
    this.#mapItemIdToRenderingItem.set(item.uuid, mesh)

    item.parentCoordinate.setSetChildCallback((parent, child) => this.coordinateSetChildCallbackHandler(parent, child))
    item.parentCoordinate.setRemoveChildCallback((parent, child) => this.coordinateRemoveChildCallbackHandler(parent, child))
    item.parentCoordinate.setUpdateCallback(() => syncCoordinate(item.parentCoordinate, mesh))

    syncCoordinate(item.parentCoordinate, mesh)
  }

  removeItem(item: Item) {
    const renderingItem = this.#mapItemIdToRenderingItem.get(item.uuid)
    if (!renderingItem) return

    this.#scene.remove(renderingItem)
    this.#mapItemIdToRenderingItem.delete(item.uuid)
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

  setColor(item: Item, color: RGBColor) {
    const renderingItem = this.#mapItemIdToRenderingItem.get(item.uuid)
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
