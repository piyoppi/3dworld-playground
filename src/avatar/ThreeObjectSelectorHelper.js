export const getObject3D = (obj, evaluator) => {
  return [
    ...obj.children.filter(child => evaluator(child)),
    ...obj.children.map(child => getObject3D(child, evaluator)).flat(),
  ]
}

export const getMeshes = obj => getObject3D(obj, obj => obj.isMesh)
export const getBones = obj => getObject3D(obj, obj => obj.isBone)
