import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    content: String
  }

  async share(event) {
    event.preventDefault()
    
    const url = this.contentValue || window.location.href
    const button = event.currentTarget
    const originalHTML = button.innerHTML

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          url: url
        })
        return
      } catch (err) {
        // User cancelled or share failed, fall through to clipboard
        if (err.name === 'AbortError') {
          return // User cancelled, do nothing
        }
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      
      // Replace button content with "Copied"
      button.innerHTML = 'Copied'
      
      // Restore original content after 2 seconds
      setTimeout(() => {
        button.innerHTML = originalHTML
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
};
