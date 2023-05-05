import type { RenderingObject } from "../../../../../lib/RenderingObject"
import type { MouseButton, MouseControllable, MouseControllableCallbackFunction, WindowCursor } from "../../../../../lib/mouse/MouseControllable"
import type { Marker } from "../../../../../lib/markers/Marker"
import type { HaconiwaWorldItem } from "../../../World/HaconiwaWorldItem"
import type { Renderer } from "../../../../../lib/Renderer"
import type { Raycaster } from "../../../../../lib/Raycaster"
import type { MouseControlHandles } from "../../../../../lib/mouse/MouseControlHandles"
import type { RenderingObjectBuilder } from "../../../../../lib/RenderingObjectBuilder"
import type { ItemGeneratorProcess, ItemGeneratorProcessPhase } from "../ItemGeneratorProcess"
import type { ReadOnlyRaycaster } from "../../../../../lib/ReadOnlyRaycaster"
import type { Colider, CoordinatedColider } from "../../../../../lib/Colider"
import { ItemGenerateState } from "./ItemGenerateState.js"
import { CallbackFunctions } from "../../../../../lib/CallbackFunctions.js"
import { Coordinate } from "../../../../../lib/Coordinate.js"
import { ItemHandler } from "./../ItemHandler.js"
import { HandlingProcess } from "../HandlingProcess"

type CompletedCallback = (handler: ItemHandler) => void

export class ItemGenerateHandler<T extends RenderingObject> implements MouseControllable {
  private completedCallback = new CallbackFunctions<CompletedCallback>()

  private generatorProcess: ItemGeneratorProcess<T> | null = null
  private itemGenerateState = new ItemGenerateState()

  constructor(
    private itemGeneratorProcessFactory: () => Promise<ItemGeneratorProcess<T>>,
    private renderer: Renderer<T>,
    private markerRaycaster:  Raycaster<CoordinatedColider>,
    private planeRaycaster:  ReadOnlyRaycaster,
    private markersMouseControlHandles: MouseControlHandles,
    private renderingObjectBuilder: RenderingObjectBuilder<T>,
    private callbacks: {
      onSelected: (itemHandler: ItemHandler) => (() => void),
      onCompleted: (itemHandler: ItemHandler) => void
    }
  ) {
  }

  setStartedCallback(func: MouseControllableCallbackFunction) {

  }

  removeStartedCallback(func: MouseControllableCallbackFunction) {

  }

  setCompletedCallback(func: MouseControllableCallbackFunction) {
    this.completedCallback.add(func)
  }

  wheel?: ((delta: number) => void) | undefined

  get isStart() {
    return !!this.generatorProcess
  }

  get isRunning() {
    return this.isStart
  }

  start(cursor: WindowCursor, button: MouseButton, _: Coordinate) {
    if (!this.isStart) {
      this.itemGeneratorProcessFactory().then((generatorProcess) => {
        this.generatorProcess = generatorProcess
        this.process(generatorProcess, 'start', cursor, button)
      })
    }
  }

  move(cursor: WindowCursor, button: MouseButton, _: Coordinate) {
    if (this.generatorProcess) {
      this.process(this.generatorProcess, 'move', cursor, button)
    }
  }

  end(cursor: WindowCursor, button: MouseButton, _: Coordinate) {
    if (this.generatorProcess) {
      this.process(this.generatorProcess, 'end', cursor, button)
    }
  }

  process(generatorProcess: ItemGeneratorProcess<T>, phase: ItemGeneratorProcessPhase, cursor: WindowCursor, button: MouseButton) {
    const markerRenderingCoordinates = new Map<Marker, Coordinate>()

    const registerMarker = (marker: Marker) => {
      if (marker.makeRenderingObject) {
        const renderingObject = marker.makeRenderingObject(this.renderingObjectBuilder)
        const coordinate = new Coordinate()
        markerRenderingCoordinates.set(marker, coordinate)
        marker.parentCoordinate.addChild(coordinate)
        this.itemGenerateState.addRenderingObjectCoordinate(coordinate)
        this.renderer.addItem(coordinate, renderingObject)
      }
      this.itemGenerateState.addMarker(marker)
      marker.attach(this.markerRaycaster, this.markersMouseControlHandles)
    }

    const removeMarker = (marker: Marker) => {
      marker.detach(this.markerRaycaster, this.markersMouseControlHandles)

      const coordinate = markerRenderingCoordinates.get(marker)
      if (coordinate) {
        this.renderer.removeItem(coordinate)
      }

      this.itemGenerateState.removeMarker(marker)
    }

    const register = (item: HaconiwaWorldItem, renderingObject: T): Coordinate => {
      const coordinateForRendering = new Coordinate()
      item.original.parentCoordinate.addChild(coordinateForRendering)

      this.itemGenerateState.addItem(item)
      this.itemGenerateState.addRenderingObjectCoordinate(coordinateForRendering)
      this.renderer.addItem(coordinateForRendering, renderingObject)

      return coordinateForRendering
    }

    const select = (coliders: Colider[], handlingProcess: HandlingProcess, unselected: () => void) => {  
      const ready = () => {
        this.markersMouseControlHandles.removeBeforeMouseUpCallback(ready)

        const checkSelected = () => {
          if (!coliders.some(c => this.markerRaycaster.has(c))) {
            unselected()
            unselectedCallback()
            this.markersMouseControlHandles.removeBeforeMouseDownCallback(checkSelected)
          }
        }

        this.markersMouseControlHandles.addBeforeMouseDownCallback(checkSelected)
      }

      this.markersMouseControlHandles.addBeforeMouseUpCallback(ready)
      const unselectedCallback = this.callbacks.onSelected(new ItemHandler(this.itemGenerateState, handlingProcess))
    }

    const addRenderingObject = (coordinate: Coordinate, renderingObject: T) => {
      this.itemGenerateState.addRenderingObjectCoordinate(coordinate)
      this.renderer.addItem(coordinate, renderingObject)
    }

    const removeRenderingObject = (coordinate: Coordinate) => {
      this.itemGenerateState.removeRenderingObjectCoordinate(coordinate)
      this.renderer.removeItem(coordinate)
    }

    const handlingProcess = generatorProcess.process({
      phase,
      getPosition: () => this.planeRaycaster.colidedDetails[0].position,
      register,
      registerMarker,
      removeMarker,
      select,
      getCamera: () => this.renderer.camera,
      getRenderingObjectBuilder: () => this.renderingObjectBuilder,
      addRenderingObject,
      removeRenderingObject,
      getMarkerRaycaster: () => this.markerRaycaster.getReadonly(),
      cursor,
      button,
    })

    if (handlingProcess) {
      if (this.itemGenerateState.hasState()) {
        const handler = new ItemHandler(this.itemGenerateState, handlingProcess)
        this.completedCallback.call(handler)
      }
    }
  }
}
