import { getBonesTree, ObjectTree } from './ThreeObjectSelectorHelper.js'
import { Item } from '../Item.js'
import { BoxGeometry, MeshBasicMaterial, Object3D, Group } from 'three'
import { Coordinate } from '../Coordinate.js'
import { ThreePrimitiveRenderingObject, ThreeRenderingObject } from './ThreeRenderer.js'

export const extractItemsFromThreeBones = (group: Group, rootItem: Item) => {
  const treeRoots = getBonesTree(group)

  const bones = treeRoots.map(tree => makeItemsFromTree(tree)).flat()

  bones.filter(bone => !bone.item.parentCoordinate.parent).forEach(bone => {
    rootItem.parentCoordinate.addChild(bone.item.parentCoordinate)
  })

  return bones
}

const makeItemsFromTree = (tree: ObjectTree<Object3D>, parentCoordinate: Coordinate | null = null): Array<{item: Item, renderingObject: ThreeRenderingObject}> => {
  const coordinate = new Coordinate
  const item = new Item()
  coordinate.addItem(item)
  if (parentCoordinate) parentCoordinate.addChild(coordinate)

  const geometry = new BoxGeometry(0.02, 0.02, 0.02)
  const material = new MeshBasicMaterial({color: 0x00FF00})
  material.depthTest = false
  const renderingObject = new ThreeRenderingObject(new ThreePrimitiveRenderingObject(geometry, material))

  coordinate.setMatrix(tree.target.matrix.toArray())

  const children = tree.children.map(child => makeItemsFromTree(child, coordinate)).flat()

  return [
    {item, renderingObject}, ...children
  ]
}
