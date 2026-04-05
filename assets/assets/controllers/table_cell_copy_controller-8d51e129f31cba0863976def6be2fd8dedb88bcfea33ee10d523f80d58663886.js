import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["content", "buttonText"]

  copy(event) {
    event.preventDefault()
    event.stopPropagation()
    
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    
    const cellContent = this.contentTarget.innerText.trim()
    
    navigator.clipboard.writeText(cellContent).then(() => {
      if (!this.originalText) {
        this.originalText = this.buttonTextTarget.textContent
      }
      
      this.buttonTextTarget.textContent = 'Copied'
      
      this.timeout = setTimeout(() => {
        this.buttonTextTarget.textContent = this.originalText
        this.originalText = null
        this.timeout = null
      }, 1500)
    })
  }
}
;
