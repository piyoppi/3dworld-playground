export const getObject3D = (obj, evaluator) => {
  return [
    ...obj.children.filter(child => evaluator(child)),
    ...obj.children.map(child => getObject3D(child, evaluator)).flat(),
  ]
}

export const flatTree = (tree, evaluator) => {
  return [
    ...obj.children.filter(child => evaluator(child)),
    ...obj.children.map(child => getObject3D(child, evaluator)).flat(),
  ]
}

const findRootItem = (obj, evaluator) => {
  if (evaluator(obj)) return [obj]

  return obj.children.map(child => findRootItem(child, evaluator)).filter(item => item.length > 0).flat()
}

export const getObject3DTree = (obj, evaluator) => {
  const rootItem = findRootItem(obj, evaluator)

  return rootItem.map(item => ({
    target: item,
    children: item.children.map(child => getObject3DTree(child, evaluator)).flat()
  }))
}

export const getMeshes = obj => getObject3D(obj, obj => obj.isMesh)
export const getBones = obj => getObject3D(obj, obj => obj.isBone)
export const getBonesTree = obj => getObject3DTree(obj, obj => obj.isBone)
