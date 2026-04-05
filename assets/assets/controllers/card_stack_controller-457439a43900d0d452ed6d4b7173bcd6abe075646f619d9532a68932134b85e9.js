// app/javascript/controllers/faq_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["content", "overlay", "card"]
  
  connect() {
    // Add event listener for ESC key
    document.addEventListener('keydown', this.handleKeydown.bind(this))
  }
  
  disconnect() {
    // Clean up event listener when controller is disconnected
    document.removeEventListener('keydown', this.handleKeydown)
  }
  
  handleKeydown(event) {
    if (event.key === 'Escape' && !this.cardTarget.classList.contains('translate-y-full')) {
      this.hide()
    }
  }
  
  show(event) {
    if (event) event.preventDefault()
    
    // First make overlay visible but transparent
    this.overlayTarget.classList.remove('pointer-events-none')
    
    // Small delay to ensure elements are in the DOM flow
    requestAnimationFrame(() => {
      // Fade in overlay
      this.contentTarget.classList.add('blur-sm')
      this.overlayTarget.classList.add('bg-opacity-30', 'backdrop-blur-sm')
      this.overlayTarget.classList.add('opacity-100')

      setTimeout(() => {
        // Slide up card
        this.cardTarget.classList.remove('translate-y-full')

        // Lock scrolling
        document.body.style.overflow = 'hidden'
      }, 400)
    })
  }
  
  hide(event) {
    // Fade out overlay
    this.contentTarget.classList.remove('blur-sm')
    this.overlayTarget.classList.remove('bg-opacity-30', 'backdrop-blur-sm')
    this.overlayTarget.classList.remove('opacity-100')
    this.overlayTarget.classList.add('opacity-0')
    
    // Slide down card
    this.cardTarget.classList.add('translate-y-full')
    
    // Re-enable scrolling
    document.body.style.overflow = ''
    
    // After animation completes, disable pointer events on overlay
    setTimeout(() => {
      this.overlayTarget.classList.add('pointer-events-none')
    }, 300) // Match the duration-300 class
  }
  
  hideIfClickedOutside(event) {
    if (event.target === this.overlayTarget) {
      this.hide()
    }
  }
};
