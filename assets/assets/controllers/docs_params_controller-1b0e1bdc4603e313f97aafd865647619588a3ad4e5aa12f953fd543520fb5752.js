import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["section"]

  connect() {
    this.isOpen = false
  }

  toggle() {
    this.isOpen = !this.isOpen
    this.updateUi()
  }

  updateUi() {
    if (this.isOpen) {
      this.sectionTarget.dataset.open = ""
    } else {
      delete this.sectionTarget.dataset.open
    }
  }
}
;
