import { Line } from "three";
import { Item } from "./Item";

export class LineItem extends Item {
  #line: Line

  constructor(line: Line) {
    super()
    this.#line = line
  }
}
