import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["trigger"]
  static values = { value: String }

  copy() {
    navigator.clipboard.writeText(this.valueValue)
    
    this.triggerTarget.setAttribute("data-copied", "")
    
    if (this.resetTimer) {
      clearTimeout(this.resetTimer)
    }
    
    this.resetTimer = setTimeout(() => {
      this.triggerTarget.removeAttribute("data-copied")
    }, 2000)
  }

  disconnect() {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer)
    }
  }
}
;
