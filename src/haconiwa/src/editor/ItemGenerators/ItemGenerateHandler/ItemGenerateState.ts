import { Coordinate } from "../../../../../lib/Coordinate"
import { Marker } from "../../../../../lib/markers/Marker"
import { HaconiwaWorldItem } from "../../../World/HaconiwaWorldItem"

export class ItemGenerateState {
  private renderingObjectCoordinates: Coordinate[] = []
  private markers: Marker[] = []
  private items: HaconiwaWorldItem[] = []

  constructor() {
    console.log('ItemGenerateState')
  }

  hasState() {
    return this.renderingObjectCoordinates.length > 0 || this.markers.length > 0 || this.items.length > 0
  }

  addRenderingObjectCoordinate(coordinate: Coordinate) {
    this.renderingObjectCoordinates.push(coordinate)
  }

  addMarker(marker: Marker) {
    this.markers.push(marker)
  }

  addItem(item: HaconiwaWorldItem) {
    this.items.push(item)
  }

  removeRenderingObjectCoordinate(coordinate: Coordinate) {
    this.renderingObjectCoordinates = this.renderingObjectCoordinates.filter(c => c !== coordinate)
  }

  removeMarker(marker: Marker) {
    this.markers = this.markers.filter(m => m !== marker)
  }

  removeItem(item: HaconiwaWorldItem) {
    this.items = this.items.filter(i => i !== item)
  }

  getMarkers() {
    return [...this.markers]
  }

  getRenderingObjectCoordinates() {
    return [...this.renderingObjectCoordinates]
  }

  getItems() {
    return [...this.items]
  }

  get() {
    return {
      renderingObjectCoordinates: [...this.renderingObjectCoordinates],
      markers: [...this.markers],
      items: [...this.items],
    }
  }
}
