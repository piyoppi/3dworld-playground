/**
 * [a11, a21, a31, a41, ... , a14, a24, a34, a44]
 */
export type MatrixArray4 = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number]
export type MatrixArray3 = [number, number, number, number, number, number, number, number, number]
export type VectorArray2 = [number, number]
export type VectorArray3 = [number, number, number]
export type VectorArray4 = [number, number, number, number]

export class Mat4 {
  static mul(a: MatrixArray4, b: MatrixArray4): MatrixArray4 {
    return [
       a[0] * b[ 0] + a[4] * b[ 1] + a[ 8] * b[ 2] + a[12] * b[ 3],
       a[1] * b[ 0] + a[5] * b[ 1] + a[ 9] * b[ 2] + a[13] * b[ 3],
       a[2] * b[ 0] + a[6] * b[ 1] + a[10] * b[ 2] + a[14] * b[ 3],
       a[3] * b[ 0] + a[7] * b[ 1] + a[11] * b[ 2] + a[15] * b[ 3],
       a[0] * b[ 4] + a[4] * b[ 5] + a[ 8] * b[ 6] + a[12] * b[ 7],
       a[1] * b[ 4] + a[5] * b[ 5] + a[ 9] * b[ 6] + a[13] * b[ 7],
       a[2] * b[ 4] + a[6] * b[ 5] + a[10] * b[ 6] + a[14] * b[ 7],
       a[3] * b[ 4] + a[7] * b[ 5] + a[11] * b[ 6] + a[15] * b[ 7],
       a[0] * b[ 8] + a[4] * b[ 9] + a[ 8] * b[10] + a[12] * b[11],
       a[1] * b[ 8] + a[5] * b[ 9] + a[ 9] * b[10] + a[13] * b[11],
       a[2] * b[ 8] + a[6] * b[ 9] + a[10] * b[10] + a[14] * b[11],
       a[3] * b[ 8] + a[7] * b[ 9] + a[11] * b[10] + a[15] * b[11],
       a[0] * b[12] + a[4] * b[13] + a[ 8] * b[14] + a[12] * b[15],
       a[1] * b[12] + a[5] * b[13] + a[ 9] * b[14] + a[13] * b[15],
       a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15],
       a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15]
    ]
  }

  static mulVec4(a: MatrixArray4, b: VectorArray4): VectorArray4 {
    return [
      a[0] * b[0] + a[4] * b[1] + a[8]  * b[2] + a[12] * b[3],
      a[1] * b[0] + a[5] * b[1] + a[9]  * b[2] + a[13] * b[3],
      a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3],
      a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3],
    ]
  }

  static mulVec3(a: MatrixArray4, b: VectorArray3): VectorArray3 {
    return [
      a[0] * b[0] + a[4] * b[1] + a[8]  * b[2] + a[12],
      a[1] * b[0] + a[5] * b[1] + a[9]  * b[2] + a[13],
      a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14]
    ]
  }

  static mulGlVec3(a: MatrixArray4, b: VectorArray3): VectorArray3 {
    const vec = Mat4.mulVec4(a, [...b, 1])
    const w = vec[3]

    return [
      vec[0] / w,
      vec[1] / w,
      vec[2] / w
    ]
  }

  static getIdentityMatrix(): MatrixArray4 {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]
  }

  static mulAll(matrixes: Array<MatrixArray4>): MatrixArray4 {
    let currentMat = matrixes[0]
    for(let i = 1; i < matrixes.length; i++ ) {
      currentMat = Mat4.mul(matrixes[i], currentMat)
    }
    return currentMat
  }

  static rotateX(rad: number): MatrixArray4 {
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)

    return [
      1.0,  0.0, 0.0, 0.0,
      0.0,  cos, sin, 0.0,
      0.0, -sin, cos, 0.0,
      0.0,  0.0, 0.0, 1.0
    ]
  }

  static rotateY(rad: number): MatrixArray4 {
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)

    return [
      cos, 0.0, -sin, 0.0,
      0.0, 1.0,  0.0, 0.0,
      sin, 0.0,  cos, 0.0,
      0.0, 0.0,  0.0, 1.0
    ]
  }

  static rotateZ(rad: number): MatrixArray4 {
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)

    return [
       cos, sin, 0.0, 0.0,
      -sin, cos, 0.0, 0.0,
       0.0, 0.0, 1.0, 0.0,
       0.0, 0.0, 0.0, 1.0
    ]
  }

  static translate(x: number, y: number, z: number): MatrixArray4 {
    return [
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
        x,   y,   z, 1.0
    ]
  }

  static scale(x: number, y: number, z: number): MatrixArray4 {
    return [
        x, 0.0, 0.0, 0.0,
      0.0,   y, 0.0, 0.0,
      0.0, 0.0,   z, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]
  }

  static mirrorZ(): MatrixArray4 {
    return [
      1.0, 0.0,  0.0, 0.0,
      0.0, 1.0,  0.0, 0.0,
      0.0, 0.0, -1.0, 0.0,
      0.0, 0.0,  0.0, 1.0
    ]
  }

  static mirrorX(): MatrixArray4 {
    return [
      -1.0, 0.0, 0.0, 0.0,
       0.0, 1.0, 0.0, 0.0,
       0.0, 0.0, 1.0, 0.0,
       0.0, 0.0, 0.0, 1.0
    ]
  }

  static mirrorY(): MatrixArray4 {
    return [
      1.0,  0.0, 0.0, 0.0,
      0.0, -1.0, 0.0, 0.0,
      0.0,  0.0, 1.0, 0.0,
      0.0,  0.0, 0.0, 1.0
    ]
  }

  static fromMatrixArray3(mat: MatrixArray3): MatrixArray4 {
    return [
      mat[0], mat[1], mat[2], 0,
      mat[3], mat[4], mat[5], 0,
      mat[6], mat[7], mat[8], 0,
      0,           0,      0, 1
    ]
  }

  static inverse(mat: MatrixArray4): MatrixArray4 {
    const a11 = mat[0]
    const a12 = mat[1]
    const a13 = mat[2]
    const a14 = mat[3]
    const a21 = mat[4]
    const a22 = mat[5]
    const a23 = mat[6]
    const a24 = mat[7]
    const a31 = mat[8]
    const a32 = mat[9]
    const a33 = mat[10]
    const a34 = mat[11]
    const a41 = mat[12]
    const a42 = mat[13]
    const a43 = mat[14]
    const a44 = mat[15]

    const det =
      a11 * a22 * a33 * a44
      + a11 * a23 * a34 * a42
      + a11 * a24 * a32 * a43
      - a11 * a24 * a33 * a42
      - a11 * a23 * a32 * a44
      - a11 * a22 * a34 * a43
      - a12 * a21 * a33 * a44
      - a13 * a21 * a34 * a42
      - a14 * a21 * a32 * a43
      + a14 * a21 * a33 * a42
      + a13 * a21 * a32 * a44
      + a12 * a21 * a34 * a43
      + a12 * a23 * a31 * a44
      + a13 * a24 * a31 * a42
      + a14 * a22 * a31 * a43
      - a14 * a23 * a31 * a42
      - a13 * a22 * a31 * a44
      - a12 * a24 * a31 * a43
      - a12 * a23 * a34 * a41
      - a13 * a24 * a32 * a41
      - a14 * a22 * a33 * a41
      + a14 * a23 * a32 * a41
      + a13 * a22 * a34 * a41
      + a12 * a24 * a33 * a41

    return [
      (a22 * a33 * a44 + a23 * a34 * a42 + a24 * a32 * a43 - a24 * a33 * a42 - a23 * a32 * a44 - a22 * a34 * a43) / det,
      (-a12 * a33 * a44 - a13 * a34 * a42 - a14 * a32 * a43 + a14 * a33 * a42 + a13 * a32 * a44 + a12 * a34 * a43) / det,
      (a12 * a23 * a44 + a13 * a24 * a42 + a14 * a22 * a43 - a14 * a23 * a42 - a13 * a22 * a44 - a12 * a24 * a43) / det,
      (-a12 * a23 * a34 - a13 * a24 * a32 - a14 * a22 * a33 + a14 * a23 * a32 + a13 * a22 * a34 + a12 * a24 * a33) / det,
      (-a21 * a33 * a44 - a23 * a34 * a41 - a24 * a31 * a43 + a24 * a33 * a41 + a23 * a31 * a44 + a21 * a34 * a43) / det,
      (a11 * a33 * a44 + a13 * a34 * a41 + a14 * a31 * a43 - a14 * a33 * a41 - a13 * a31 * a44 - a11 * a34 * a43) / det,
      (-a11 * a23 * a44 - a13 * a24 * a41 - a14 * a21 * a43 + a14 * a23 * a41 + a13 * a21 * a44 + a11 * a24 * a43) / det,
      (a11 * a23 * a34 + a13 * a24 * a31 + a14 * a21 * a33 - a14 * a23 * a31 - a13 * a21 * a34 - a11 * a24 * a33) / det,
      (a21 * a32 * a44 + a22 * a34 * a41 + a24 * a31 * a42 - a24 * a32 * a41 - a22 * a31 * a44 - a21 * a34 * a42) / det,
      (-a11 * a32 * a44 - a12 * a34 * a41 - a14 * a31 * a42 + a14 * a32 * a41 + a12 * a31 * a44 + a11 * a34 * a42) / det,
      (a11 * a22 * a44 + a12 * a24 * a41 + a14 * a21 * a42 - a14 * a22 * a41 - a12 * a21 * a44 - a11 * a24 * a42) / det,
      (-a11 * a22 * a34 - a12 * a24 * a31 - a14 * a21 * a32 + a14 * a22 * a31 + a12 * a21 * a34 + a11 * a24 * a32) / det,
      (-a21 * a32 * a43 - a22 * a33 * a41 - a23 * a31 * a42 + a23 * a32 * a41 + a22 * a31 * a43 + a21 * a33 * a42) / det,
      (a11 * a32 * a43 + a12 * a33 * a41 + a13 * a31 * a42 - a13 * a32 * a41 - a12 * a31 * a43 - a11 * a33 * a42) / det,
      (-a11 * a22 * a43 - a12 * a23 * a41 - a13 * a21 * a42 + a13 * a22 * a41 + a12 * a21 * a43 + a11 * a23 * a42) / det,
      (a11 * a22 * a33 + a12 * a23 * a31 + a13 * a21 * a32 - a13 * a22 * a31 - a12 * a21 * a33 - a11 * a23 * a32) / det
    ]
  }

  static transpose(a: MatrixArray4): MatrixArray4 {
    return [
      a[0], a[4], a[8],  a[12],
      a[1], a[5], a[9],  a[13],
      a[2], a[6], a[11], a[14],
      a[3], a[7], a[12], a[15],
    ]
  }

  static removeTranslate(a: MatrixArray4): MatrixArray3 {
    return [
      a[0], a[1], a[2],
      a[4], a[5], a[6],
      a[8], a[9], a[10]
    ]
  }

  static convertToDirectionalTransformMatrix(a: MatrixArray4): MatrixArray3 {
    return Mat3.transpose(Mat3.inverse(Mat4.removeTranslate(a)))
  }

  static lookAt(targetPosition: VectorArray3, cameraPosition: VectorArray3): MatrixArray4 {
    return Mat4.transformZAxis(
      Vec3.normalize([
        cameraPosition[0] - targetPosition[0],
        cameraPosition[1] - targetPosition[1],
        cameraPosition[2] - targetPosition[2]
      ]),
      cameraPosition
    )
  }

  static rotate(direction: VectorArray3, angle: number): MatrixArray4 {
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)
    const a = 1 - cos

    return [
      direction[0] * direction[0] * a + cos,
      direction[0] * direction[1] * a + direction[2] * sin,
      direction[0] * direction[2] * a - direction[1] * sin,
      0,
      direction[0] * direction[1] * a - direction[2] * sin,
      direction[1] * direction[1] * a + cos,
      direction[1] * direction[2] * a + direction[0] * sin,
      0,
      direction[0] * direction[2] * a + direction[1] * sin,
      direction[1] * direction[2] * a - direction[0] * sin,
      direction[2] * direction[2] * a + cos,
      0,
      0,
      0,
      0,
      1
    ]
  }

  static transformZAxis(direction: VectorArray3, position: VectorArray3 = [0, 0, 0]): MatrixArray4 {
    let xAxis: VectorArray3
    let yAxis: VectorArray3

    if (Math.abs(Vec3.dotprod(direction, [0, 1, 0])) > 0.9999) {
      yAxis = [0, 0, 1]
      xAxis = [1, 0, 0]
    } else {
      xAxis = Vec3.normalize(Vec3.cross([0, 1, 0], direction))
      yAxis = Vec3.normalize(Vec3.cross(direction, xAxis))
    }

    return [
      ...xAxis, 0,
      ...yAxis, 0,
      ...direction, 0,
      ...position, 1
    ]
  }

  static transformYAxis(direction: VectorArray3, position: VectorArray3 = [0, 0, 0]): MatrixArray4 {
    let xAxis: VectorArray3
    let zAxis: VectorArray3

    if (Math.abs(Vec3.dotprod(direction, [0, 0, 1])) < 0.001) {
      xAxis = Vec3.normalize(Vec3.cross([0, 0, 1], direction))
      zAxis = Vec3.normalize(Vec3.cross(xAxis, direction))
    } else {
      zAxis = Vec3.normalize(Vec3.cross([1, 0, 0], direction))
      xAxis = Vec3.normalize(Vec3.cross(zAxis, direction))
    }

    return [
      ...xAxis, 0,
      ...direction, 0,
      ...zAxis, 0,
      ...position, 1
    ]
  }

  static perspective(fov: number, aspect: number, near: number, far: number) {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fov)
    const rangeInv = 1.0 / (near - far)

    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ]
  }

  static perspective2(top: number, bottom: number, left: number, right: number, near: number, far: number) {
    return [
      (2 * near) / (right - left), 0, 0, 0,
      0, (2 * near) / (top - bottom), 0, 0,
      (right + left) / (right - left), (top + bottom) / (top - bottom), -(far + near) / (far - near), -1,
      0, 0, -(2 * far * near) / (far - near), 0
    ]
  }
}

export class Mat3 {
  static inverse(m: MatrixArray3): MatrixArray3 {
    const a11 = m[0]
    const a12 = m[3]
    const a13 = m[6]
    const a21 = m[1]
    const a22 = m[4]
    const a23 = m[7]
    const a31 = m[2]
    const a32 = m[5]
    const a33 = m[8]

    const det =
        a11 * a22 * a33
      + a12 * a23 * a31
      + a13 * a21 * a32
      - a13 * a22 * a31
      - a12 * a21 * a33
      - a11 * a23 * a32

    return [
        (a22 * a33 - a23 * a32) / det,
      - (a21 * a33 - a23 * a31) / det,
        (a21 * a32 - a22 * a31) / det,
      - (a12 * a33 - a13 * a32) / det,
        (a11 * a33 - a13 * a31) / det,
      - (a11 * a32 - a12 * a31) / det,
        (a12 * a23 - a13 * a22) / det,
      - (a11 * a23 - a13 * a21) / det,
        (a11 * a22 - a12 * a21) / det
    ]
  }

  static fromMatrixArray4(m: MatrixArray4): MatrixArray3 {
    return [
      m[0], m[1], m[2],
      m[4], m[5], m[6],
      m[8], m[9], m[10]
    ]
  }

  static getIdentityMatrix(): MatrixArray3 {
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ]
  }

  static transpose(m: MatrixArray3): MatrixArray3 {
    return [
      m[0], m[3], m[6],
      m[1], m[4], m[7],
      m[2], m[5], m[8]
    ]
  }


  static mulVec3(a: MatrixArray3, b: VectorArray3): VectorArray3 {
    return [
      a[0] * b[0] + a[3] * b[1] + a[6] * b[2],
      a[1] * b[0] + a[4] * b[1] + a[7] * b[2],
      a[2] * b[0] + a[5] * b[1] + a[8] * b[2]
    ]
  }
}

export class Vec3 {
  static normalize(vec: VectorArray3): VectorArray3 {
    const len = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2])
    return len > 0.0001 ? [vec[0] / len, vec[1] / len, vec[2] / len] : [0, 0, 0]
  }

  static cross(a: VectorArray3, b: VectorArray3): VectorArray3 {
    return [
      a[1] * b[2] - b[1] * a[2],
      a[2] * b[0] - b[2] * a[0],
      a[0] * b[1] - b[0] * a[1]
    ]
  }

  static dotprod(a: VectorArray3, b: VectorArray3) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  }

  static mulScale(a: VectorArray3, scale: number): VectorArray3 {
    return [a[0] * scale, a[1] * scale, a[2] * scale]
  }

  static reverse(a: VectorArray3): VectorArray3 {
    return Vec3.mulScale(a, -1)
  }

  static norm(vec: VectorArray3): number {
    return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2])
  }

  static subtract(a: VectorArray3, b: VectorArray3): VectorArray3 {
    return [
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2]
    ]
  }

  static add(a: VectorArray3, b: VectorArray3): VectorArray3 {
    return [
        a[0] + b[0],
        a[1] + b[1],
        a[2] + b[2]
    ]
  }
}

export class Vec4 {
  static normalize(vec: VectorArray4): VectorArray4 {
    const len = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2] + vec[3] * vec[3])
    return len > 0.0001 ? [vec[0] / len, vec[1] / len, vec[2] / len, vec[3] / len] : [0, 0, 0, 0]
  }
}

export class Vec2 {
  static dotprod(a: VectorArray2, b: VectorArray2) {
    return a[0] * b[0] + a[1] * b[1]
  }

  static norm(a: VectorArray2) {
    return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2))
  }
}
