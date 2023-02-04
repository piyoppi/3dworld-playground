import { LineItem, LineItemConnection } from "../../../../lib/LineItem/index.js"
import type { Raycaster } from "../../../../lib/Raycaster"
import type { Renderer } from "../../../../lib/Renderer"
import { LineRenderingItemGenerator } from '../../../../lib/itemGenerators/lineItemGenerator/LineRenderingItemGenerator.js'
import { LineSegmentGenerator } from '../../../../lib/itemGenerators/lineItemGenerator/lineGenerator/LineSegmentGenerator.js'
import type {
  HaconiwaItemGenerator,
  HaconiwaItemGeneratorFactory,
  HaconiwaItemGeneratorClonedItem,
  HaconiwaItemGeneratorLineConnectable,
  HaconiwaItemGeneratorItemClonable,
} from "./HaconiwaItemGenerator"
import { Coordinate } from "../../../../lib/Coordinate.js"
import { LineItemGenerator } from "../../../../lib/itemGenerators/lineItemGenerator/LineItemGenerator.js"
import type { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder.js"
import { MouseButton, WindowCursor } from "../../../../lib/mouse/MouseControllable.js"
import type { ColiderItemMap } from "../../../../lib/ColiderItemMap.js"
import { makeConnectionMarker } from './Helpers/MakeConnectionMarker.js'
import { RenderingObject } from "../../../../lib/RenderingObject.js"
import { HaconiwaItemGeneratorBase } from "./HaconiwaItemGeneratorBase.js"
import { CoordinatedColider } from '../../../../lib/Colider.js'

export class HaconiwaLineItemGenerator<T extends RenderingObject>
  extends HaconiwaItemGeneratorBase<T>
  implements HaconiwaItemGenerator<T>, HaconiwaItemGeneratorLineConnectable, HaconiwaItemGeneratorItemClonable<T>  {
  #planeRaycaster: Raycaster
  #markerRaycaster: Raycaster<CoordinatedColider>
  #renderingObjectBuilder: RenderingObjectBuilder<T>
  private original: HaconiwaItemGeneratorClonedItem<T> | null = null
  #renderer
  #coliderConnectionMap: ColiderItemMap<LineItemConnection> | null = null
  #generatedItem: LineItem | null = null

  constructor(renderer: Renderer<T>, planeRaycaster: Raycaster, markerRaycaster: Raycaster<CoordinatedColider>, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    super(markerRaycaster)

    this.#planeRaycaster = planeRaycaster
    this.#markerRaycaster = markerRaycaster
    this.#renderingObjectBuilder = renderingObjectBuilder
    this.#renderer = renderer
  }

  get generated() {
    return !!this.#generatedItem
  }

  setConnectorColiderMap(coliderConnectionMap: ColiderItemMap<LineItemConnection>) {
    this.#coliderConnectionMap = coliderConnectionMap
  }

  setOriginal(original: HaconiwaItemGeneratorClonedItem<T>) {
    this.original = original
  }

  create(cursor: WindowCursor, button: MouseButton, cameraCoordinate: Coordinate) {
    if (!this.original) throw new Error('Item and RenderingObject is not set.')
    if (!this.#planeRaycaster.hasColided || !this.#coliderConnectionMap) return

    const itemGenerator = new LineRenderingItemGenerator(this.#renderer)
    const lineGenerator = new LineSegmentGenerator()
    lineGenerator.setStartPosition(
      this.#markerRaycaster.colidedDetails[0]?.colider.parentCoordinate?.position || this.#planeRaycaster.colidedDetails[0].position
    )
    lineGenerator.setEndPosition(this.#planeRaycaster.colidedDetails[0].position)

    const lineItemGenerator = new LineItemGenerator<Coordinate, T>(() => this.itemFactory(), this.original.renderingObject.size[0])
    const line = lineGenerator.getLine()
    const item = new LineItem(line)
    this.#generatedItem = item

    makeConnectionMarker(item, this.#markerRaycaster, this.#planeRaycaster, this.#coliderConnectionMap)
      .forEach((generated, index, arr) => {
        const { marker, connection } = generated

        marker.attachRenderingObject<T>({r: 255, g: 0, b: 0}, 0.5, this.#renderingObjectBuilder, this.#renderer)

        connection.edge.coordinate.setUpdateCallback(() => {
          //item.line.setEdge(index, marker.parentCoordinate.position)
          const generated = lineItemGenerator.update(item.line)
          itemGenerator.update(generated, item.parentCoordinate)
        })

        this.registerMarker(marker)

        if (index === 1) {
          arr[1]?.marker.handlers.forEach(handler => handler.start(cursor, button, cameraCoordinate))
        }
      })


    this.registerItem(item)

    return true
  }

  unselect() {

  }

  private itemFactory() {
    if (!this.original) throw new Error('Item and RenderingObject is not set.')

    const renderingObject = this.original.renderingObject.clone() as T
  
    return {item: new Coordinate(), renderingObject}
  }
}

export class HaconiwaLineItemGeneratorFactory<T extends RenderingObject> implements HaconiwaItemGeneratorFactory<T> {
  #original: HaconiwaItemGeneratorClonedItem<T>

  constructor(original: HaconiwaItemGeneratorClonedItem<T>) {
    this.#original = original
  }

  create(renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster<CoordinatedColider>, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    const generator = new HaconiwaLineItemGenerator(renderer, raycaster, markerRaycaster, renderingObjectBuilder)
    generator.setOriginal(this.#original)

    return generator
  }
}
