import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.handleLinkClick = this.handleLinkClick.bind(this)
  }

  toggle(event) {
    event.stopPropagation()
    
    if (this.element.hasAttribute("data-open")) {
      this.close()
    } else {
      this.open()
    }
  }

  open() {
    this.element.setAttribute("data-open", "")
    document.addEventListener("click", this.handleClickOutside)
    window.addEventListener("scroll", this.handleScroll, true)
    this.element.addEventListener("click", this.handleLinkClick)
  }

  close() {
    this.element.removeAttribute("data-open")
    document.removeEventListener("click", this.handleClickOutside)
    window.removeEventListener("scroll", this.handleScroll, true)
    this.element.removeEventListener("click", this.handleLinkClick)
  }

  handleClickOutside(event) {
    if (!this.element.contains(event.target)) {
      this.close()
    }
  }

  handleScroll() {
    this.close()
  }

  handleLinkClick(event) {
    if (event.target.closest("a") || event.target.closest("button")) {
      this.close()
    }
  }

  disconnect() {
    document.removeEventListener("click", this.handleClickOutside)
    window.removeEventListener("scroll", this.handleScroll, true)
    this.element.removeEventListener("click", this.handleLinkClick)
  }
}
;
