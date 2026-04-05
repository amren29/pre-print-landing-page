import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    duration: Number,
  }

  connect() {
    this.resetTimeout = null
    this.tile = this.element.closest(".customers-card-tile")
  }

  disconnect() {
    this.clearReset()
  }

  enter() {
    this.clearReset()
    if (!this.tile) return

    this.tile.classList.remove("is-exiting")

    // Re-enter from the initial hidden state in the lower-left corner.
    if (!this.tile.classList.contains("is-entered")) {
      requestAnimationFrame(() => {
        this.tile.classList.add("is-entered")
      })
    }
  }

  leave() {
    this.clearReset()
    if (!this.tile) return

    this.tile.classList.remove("is-entered")
    this.tile.classList.add("is-exiting")

    this.resetTimeout = window.setTimeout(() => {
      this.tile.classList.remove("is-exiting")
      this.resetTimeout = null
    }, this.durationValue || 700)
  }

  clearReset() {
    if (this.resetTimeout) {
      window.clearTimeout(this.resetTimeout)
      this.resetTimeout = null
    }
  }
};
