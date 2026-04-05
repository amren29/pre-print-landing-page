// app/javascript/controllers/pass_preview_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["code"]

  copyContent(event) {
    event.preventDefault()
    
    // Get the value
    const content = this.codeTarget.innerText.trim()
    
    // Copy to clipboard
    navigator.clipboard.writeText(content)
    
    // Visual feedback for copy
    const copyIcon = event.currentTarget
    const originalHTML = copyIcon.innerHTML
    
    // Replace with checkmark temporarily
    copyIcon.innerHTML = `<svg class="h-5 w-5 stroke-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>`
    
    // Reset after animation
    setTimeout(() => {
      copyIcon.innerHTML = originalHTML
    }, 1500)
  }
};
