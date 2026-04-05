import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["dropdown", "caret"]

  connect() {
    this.closeDropdownOnOutsideClick = this.closeDropdownOnOutsideClick.bind(this)
    document.addEventListener("click", this.closeDropdownOnOutsideClick)
  }

  disconnect() {
    document.removeEventListener("click", this.closeDropdownOnOutsideClick)
  }

  toggle(event) {
    event.preventDefault()
    this.dropdownTarget.classList.toggle("hidden")
    this.caretTarget.classList.toggle("rotate-180")
    
    const isExpanded = this.dropdownTarget.classList.contains("hidden") ? "false" : "true"
    this.element.setAttribute("aria-expanded", isExpanded)
  }
  
  closeDropdownOnOutsideClick(event) {
    if (!this.element.contains(event.target)) {
      this.dropdownTarget.classList.add("hidden")
      this.caretTarget.classList.remove("rotate-180")
      this.element.setAttribute("aria-expanded", "false")
    }
  }
};
