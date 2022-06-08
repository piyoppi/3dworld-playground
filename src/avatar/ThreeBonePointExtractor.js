import { getBones, getBonesTree, flatTree } from './ThreeObjectSelectorHelper.js'
import { RenderingObject } from './RenderingObject.js'
import { Item, ThreeCoordinate } from './Item.js'
import * as THREE from 'three'

export const extractItemsFromThreeBones = (item) => {
  const treeRoots = getBonesTree(item.renderingObject.raw)

  const bones = treeRoots.map(tree => makeItemsFromTree(tree)).flat()

  return bones
}

const makeItemsFromTree = (tree) => {
  const coordinate = new ThreeCoordinate()
  const item = new Item()

  const geometry = new THREE.BoxGeometry(0.02, 0.02, 0.02)
  const material = new THREE.MeshNormalMaterial()
  material.depthTest = false
  item.renderingObject = new RenderingObject(new THREE.Mesh(geometry, material))

  coordinate.addItem(item)
  coordinate.matrix = tree.target.matrix.toArray()

  const childCoordinates = tree.children.map(child => makeItemsFromTree(child)).flat()
  childCoordinates.forEach(childCoordinate => {
    coordinate.setChild(childCoordinate)
  })

  return coordinate
}
