import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["backdrop", "modal", "iframe"]

  connect() {
    this.iframeSrc = this.iframeTarget.src
    this.close()
  }

  open(event) {
    event.preventDefault()
    this.iframeTarget.src = this.iframeSrc
    this.backdropTarget.dataset.open = ""
    this.modalTarget.dataset.open = ""
    document.body.classList.add("overflow-hidden")
  }

  close() {
    this.iframeTarget.src = ""
    delete this.backdropTarget.dataset.open
    delete this.modalTarget.dataset.open
    document.body.classList.remove("overflow-hidden")
  }

  closeOnBackdrop(event) {
    if (event.target === this.backdropTarget) {
      this.close()
    }
  }

  closeOnEscape(event) {
    if (event.key === "Escape") {
      this.close()
    }
  }
}
;
