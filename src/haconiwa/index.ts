import { HaconiwaRenderer } from "./src/renderer.js"
import { HaconiwaEditor } from "./src/editor/editor.js"
import { ThreeFactory as Factory } from '../lib/threeAdapter/ThreeFactory.js'
import { MouseCapturer } from '../lib/mouse/MouseCapturer.js'
import { HaconiwaWorld } from './src/World/index.js'
import { ThreeGroup, ThreeRenderingObject } from "../lib/threeAdapter/ThreeRenderingObject.js"
import { loadGlb } from '../lib/threeAdapter/ThreeLoaderHelper.js'
import { Item } from '../lib/Item.js'
import { ThreeRenderingObjectBuilder } from "../lib/threeAdapter/ThreeRenderingObjectBuilder.js"
import { HaconiwaLineItemGeneratorFactory } from "./src/editor/itemGenerators/HaconiwaLineItemGenerator.js"
import { RouteItemGeneratorFactory } from "./src/editor/itemGenerators/RouteItemGenerator.js"
import { RoadJointFactory } from "./src/Roads/RoadJointFactory.js"
import { MeshItemGeneratorFactory } from "./src/editor/itemGenerators/MeshItemGenerator.js"

import { ItemGeneratorProcess as RouteItemGeneratorProcess } from './src/editor/ItemGenerators/RouteItemGenerator/ItemGeneratorProcess.js'
import { ItemGeneratorProcess as MeshItemGeneratorProcess } from './src/editor/ItemGenerators/MeshItemGenerator/ItemGeneratorProcess.js'
import { Keyboard } from "./src/editor/Inputs/Keyboard.js"

const world = new HaconiwaWorld()
const factory = new Factory()
const mouseCapturer = new MouseCapturer(window.innerWidth, window.innerHeight)
const renderer = factory.makeRenderer({fov: 100, aspect: window.innerWidth / window.innerHeight, near: 0.001, far: 100})
const haconiwaRenderer = new HaconiwaRenderer(renderer, window.innerWidth, window.innerHeight)
const editor = new HaconiwaEditor(world, haconiwaRenderer, mouseCapturer, new ThreeRenderingObjectBuilder(), new Keyboard())

haconiwaRenderer.mount()
editor.captureMouseEvent()

window.addEventListener('keydown', async (e) => {
  switch(e.key) {
    case '1':
      editor.clearItemGenerator()
      break

    case '2':
      editor.setItemGeneratorFactory(
        new HaconiwaLineItemGeneratorFactory(
          {
            item: new Item(),
            renderingObject: new ThreeRenderingObject(new ThreeGroup(await loadGlb('./assets/road.glb')))
          }
        )
      )
      break

    case '3':
      const generatorFactory = new RouteItemGeneratorFactory(
        new RoadJointFactory(),
        {
          item: new Item(),
          renderingObject: new ThreeRenderingObject(new ThreeGroup(await loadGlb('./assets/road.glb')))
        }
      )
      editor.setItemGeneratorFactory(generatorFactory)
      break

    case '4':
      const meshItemGeneratorFactory = new MeshItemGeneratorFactory<ThreeRenderingObject>(
        {
          item: new Item(),
          renderingObject: new ThreeRenderingObject(new ThreeGroup(await loadGlb('./assets/house.glb')))
        }
      )
      editor.setItemGeneratorFactory(meshItemGeneratorFactory)
      break

    case '5':
      console.log(world.items)

    case '6':
      const factory = async () => new RouteItemGeneratorProcess(
        new ThreeRenderingObject(new ThreeGroup(await loadGlb('./assets/road.glb'))),
        new RoadJointFactory()
      )

    editor.setItemGeneratorProcessFactory(factory)
    break

    case '7':
      const meshFactory = async () => new MeshItemGeneratorProcess(
        new ThreeRenderingObject(new ThreeGroup(await loadGlb('./assets/house.glb')))
      )

    editor.setItemGeneratorProcessFactory(meshFactory)
    break

    case 'Delete':
      editor.removeSelectedItems()
      break
  }
})
