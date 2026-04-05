import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["colorInput", "colorValue", "hexInput"]

  connect() {
    if (this.hasColorValueTarget && this.hasColorInputTarget) {
      this.colorValueTarget.textContent = this.colorInputTarget.value
    }
  }

  updateValue(event) {
    if (this.hasColorValueTarget) {
      this.colorValueTarget.textContent = event.target.value
    }
    
    if (this.hasHexInputTarget) {
      this.hexInputTarget.value = event.target.value
    }
    
    this.dispatch("change", { detail: { value: event.target.value } })
  }

  triggerColorPicker(event) {
    if (this.hasHexInputTarget && event.target === this.hexInputTarget) {
      return // Don't trigger if clicking on hex input
    }
    this.colorInputTarget.click()
  }

  updateColorFromHex(event) {
    const hexValue = event.target.value
    if (/^#([0-9A-F]{3}){1,2}$/i.test(hexValue)) {
      this.colorInputTarget.value = hexValue
      
      if (this.hasColorValueTarget) {
        this.colorValueTarget.textContent = hexValue
      }
      
      this.dispatch("change", { detail: { value: hexValue } })
    }
  }
};
