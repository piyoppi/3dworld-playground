import { Bone, Mesh, Object3D } from "three"

type Constructor<T> = {new (...args: any): T}
export type ObjectTree<T> = {
  target: T,
  children: Array<ObjectTree<T>>
}

export const getObject3D = <T extends Object3D>(obj: Object3D, classKind: Constructor<T>): Array<T> => {
  return [
    ...obj.children.filter((child: Object3D): child is T => child instanceof classKind),
    ...obj.children.map(child => getObject3D(child, classKind)).flat(),
  ]
}

const findRootItem = <T>(obj: Object3D, classKind: Constructor<T>): Array<T> => {
  if (obj instanceof classKind) return [obj]

  return obj.children.map(child => findRootItem(child, classKind)).filter(item => item.length > 0).flat()
}

export const getObject3DTree = <T extends Object3D>(obj: Object3D, classKind: Constructor<T>): Array<ObjectTree<T>> => {
  const rootItem = findRootItem(obj, classKind)

  return rootItem.map(item => ({
    target: item,
    children: item.children.map(child => getObject3DTree(child, classKind)).flat()
  }))
}

// export const getMeshes = (obj: Mesh | never): Array<Mesh> => getObject3D<Mesh>(obj, obj => obj.isMesh)
// export const getBones = (obj: Bone | never) => getObject3D<Bone>(obj, obj => obj.isBone)
export const getBonesTree = (obj: any) => getObject3DTree(obj, Bone)
