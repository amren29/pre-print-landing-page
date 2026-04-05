import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["drawer"]

  open(event) {
    if (event) event.preventDefault()
    
    if (this.hasDrawerTarget) {
      this.drawerTarget.setAttribute('data-open', '')
    }
  }

  close(event) {
    if (event) event.preventDefault()
    
    if (this.hasDrawerTarget) {
      this.drawerTarget.removeAttribute('data-open')
    }
  }
}
;
