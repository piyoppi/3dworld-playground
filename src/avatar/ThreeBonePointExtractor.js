import { getBones, getBonesTree } from './ThreeObjectSelectorHelper.js'
import { RenderingObject } from './RenderingObject.js'
import { Item } from './Item.js'
import * as THREE from 'three'

export const extractItemsFromThreeBones = (item) => {
  const treeRoots = getBonesTree(item.renderingObject.raw)

  return treeRoots.map(tree => makeItemsFromTree(tree))
    .flat()
    .map(child => item.coordinate.setChild(child.coordinate))
}

const makeItemsFromTree = (tree) => {
  const item = new Item()

  const geometry = new THREE.BoxGeometry(0.02, 0.02, 0.02)
  const material = new THREE.MeshNormalMaterial()
  material.depthTest = false
  item.renderingObject = new RenderingObject(new THREE.Mesh(geometry, material))

  item.coordinate.matrix = tree.target.matrix.toArray()

  const childrenItems = tree.children.map(child => makeItemsFromTree(child)).flat()
  childrenItems.forEach(childItem => item.coordinate.setChild(childItem.coordinate))

  return item
}
