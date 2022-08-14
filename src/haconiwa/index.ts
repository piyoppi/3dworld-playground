import { HaconiwaRenderer } from "./src/renderer.js"
import { HaconiwaEditor } from "./src/editor/editor.js"
import { ThreeFactory as Factory } from '../lib/threeAdapter/ThreeFactory.js'
import { MouseCapturer } from '../lib/mouse/MouseCapturer.js'
import { HaconiwaLineItemGeneratorFactory } from "./src/editor/itemGenerators/HaconiwaLineItemGenerator.js"
import { ThreeRenderingObject } from "../lib/threeAdapter/ThreeRenderer.js"
import { loadGlb } from '../lib/threeAdapter/ThreeLoaderHelper.js'
import { Item } from '../lib/Item.js'

const factory = new Factory()
const mouseCapturer = new MouseCapturer(window.innerWidth, window.innerHeight)
const renderer = factory.makeRenderer({fov: 100, aspect: window.innerWidth / window.innerHeight, near: 0.001, far: 100})
const haconiwaRenderer = new HaconiwaRenderer(renderer)
const editor = new HaconiwaEditor(haconiwaRenderer, mouseCapturer)

haconiwaRenderer.initialize(window.innerWidth, window.innerHeight)
editor.captureMouseEvent()

editor.setItemGeneratorFactory(new HaconiwaLineItemGeneratorFactory(), {item: new Item(), renderingObject: new ThreeRenderingObject(await loadGlb('./assets/road.glb'))})
