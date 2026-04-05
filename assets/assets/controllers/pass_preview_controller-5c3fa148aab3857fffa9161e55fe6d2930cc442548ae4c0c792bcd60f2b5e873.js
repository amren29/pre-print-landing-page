// app/javascript/controllers/pass_preview_controller.js
import { Controller } from "@hotwired/stimulus"
import _ from "lodash"

export default class extends Controller {
  static targets = ["frame", "nameInput", "titleInput", "profileType", "desfireLink", "createButton"]

  connect() {
    // Set up debounced update
    this.debouncedUpdate = _.debounce(this.performUpdate.bind(this), 300)

    // Initial toggle of DESFire link based on selected value
    this.toggleDesfireLink()
  }

  update() {
    this.debouncedUpdate()
  }

  updateButtonText() {
    setTimeout(() => {
      this.nameInputTarget.value = "";
      this.titleInputTarget.value = "";
    }, 900)
    this.createButtonTarget.innerHTML = "Create another sample key"
  }

  performUpdate() {
    const frame = this.frameTarget
    const url = new URL(frame.src)
    
    // Add form values to URL parameters
    url.searchParams.set('name', this.nameInputTarget.value)
    url.searchParams.set('title', this.titleInputTarget.value)
    
    // Reload the frame with new parameters
    frame.src = url.toString()
  }

  toggleDesfireLink() {
    if (!this.hasDesfireLinkTarget) return
    
    const isDynamic = this.profileTypeTarget.value === "Dynamic - encrypted value"
    this.desfireLinkTarget.classList.toggle('hidden', !isDynamic)
  }
};
