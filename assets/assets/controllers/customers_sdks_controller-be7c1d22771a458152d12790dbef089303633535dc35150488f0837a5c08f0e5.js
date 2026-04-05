import { Controller } from "@hotwired/stimulus"

const STATES = [
  { x: 0, y: 0 },
  { x: 192, y: 96 },
  { x: -96, y: 144 },
  { x: 96, y: 240 },
  { x: -96, y: 48 },
  { x: 96, y: 144 },
  { x: 0, y: 288 },
  { x: -192, y: 96 },
]

export default class extends Controller {
  static targets = ["track"]

  connect() {
    this.currentIndex = 0
    this.hovered = false
    this.transitioning = false
    this.applyState(this.currentIndex)
  }

  hover() {
    this.hovered = true

    if (!this.transitioning) {
      this.advance()
    }
  }

  leave() {
    this.hovered = false
  }

  transitionEnd(event) {
    if (event.target !== this.trackTarget || event.propertyName !== "transform") {
      return
    }

    this.transitioning = false

    if (this.hovered) {
      this.advance()
    }
  }

  advance() {
    this.transitioning = true
    this.currentIndex = (this.currentIndex + 1) % STATES.length
    this.applyState(this.currentIndex)
  }

  applyState(index) {
    const state = STATES[index]
    this.trackTarget.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`
  }
};
