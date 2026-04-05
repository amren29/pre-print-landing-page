// table_overflow_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["content", "indicator"]
  static values = {
    checkOnResize: Boolean,
    checkOnContentChange: Boolean
  }
  
  connect() {
    this.checkOverflow()
    
    if (this.checkOnResizeValue) {
      this.resizeObserver = new ResizeObserver(() => {
        this.checkOverflow()
      })
      this.resizeObserver.observe(this.contentTarget)
    }
    
    if (this.checkOnContentChangeValue) {
      this.mutationObserver = new MutationObserver(() => {
        this.checkOverflow()
      })
      this.mutationObserver.observe(this.contentTarget, {
        childList: true,
        subtree: true,
        characterData: true
      })
    }
  }
  
  disconnect() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
    }
  }
  
  checkOverflow() {
    const isOverflowing = this.contentTarget.scrollWidth > this.contentTarget.clientWidth
    
    if (isOverflowing) {
      this.indicatorTarget.classList.remove('hidden')
    } else {
      this.indicatorTarget.classList.add('hidden')
    }
  }
};
