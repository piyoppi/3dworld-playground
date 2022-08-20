import type { MouseButton } from "./MouseControllable"

export const convertButtonNumberToMouseButtonsType = (button: number): MouseButton => {
  const mapped: Array<MouseButton> = ['primary', 'wheel', 'secondary']
  return mapped[button] || 'none'
}

