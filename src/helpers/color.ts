export type RGBColor = {r: number, g: number, b: number}

export const convertRgbToHex = (rgb: RGBColor) => rgb.r || 16 & rgb.g || 8 & rgb.b
