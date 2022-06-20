import { getBonesTree, ObjectTree } from './ThreeObjectSelectorHelper.js'
import { RenderingObject } from './RenderingObject.js'
import { Item } from './Item.js'
import { ThreeCoordinate } from './ThreeCoordinate.js'
import { BoxGeometry, MeshNormalMaterial, Mesh, Object3D } from 'three'

export const extractItemsFromThreeBones = (item: Item) => {
  const treeRoots = getBonesTree(item.renderingObject?.raw)

  const bones = treeRoots.map(tree => makeItemsFromTree(tree)).flat()

  return bones
}

const makeItemsFromTree = (tree: ObjectTree<Object3D>) => {
  const coordinate = new ThreeCoordinate()
  const item = new Item()

  const geometry = new BoxGeometry(0.02, 0.02, 0.02)
  const material = new MeshNormalMaterial()
  material.depthTest = false
  item.renderingObject = new RenderingObject(new Mesh(geometry, material))

  coordinate.addItem(item)
  coordinate.matrix = tree.target.matrix.toArray()

  const childCoordinates = tree.children.map(child => makeItemsFromTree(child)).flat()
  childCoordinates.forEach(childCoordinate => {
    coordinate.setChild(childCoordinate)
  })

  return coordinate
}
