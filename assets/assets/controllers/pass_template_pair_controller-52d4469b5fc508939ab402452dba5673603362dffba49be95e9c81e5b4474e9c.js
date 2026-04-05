import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["checkbox", "button", "modal"]

  connect() {
    this.updateButtonState()
  }

  checkboxChanged() {
    this.updateButtonState()
  }

  updateButtonState() {
    const androidChecked = this.element.querySelector('input[name="pass_template_pair[android_pass_template_id]"]:checked')
    const iosChecked = this.element.querySelector('input[name="pass_template_pair[ios_pass_template_id]"]:checked')
    
    // Enable button only if both Android and iOS templates are selected
    if (androidChecked && iosChecked) {
      this.buttonTarget.classList.remove('bg-slate-300', 'text-slate-500', 'cursor-not-allowed')
      this.buttonTarget.classList.add('bg-slate-800', 'text-white', 'hover:bg-slate-700', 'cursor-pointer')
    } else {
      this.buttonTarget.classList.add('bg-slate-300', 'text-slate-500', 'cursor-not-allowed')
      this.buttonTarget.classList.remove('bg-slate-800', 'text-white', 'hover:bg-slate-700', 'cursor-pointer')
    }
  }

  openModal(event) {
    event.preventDefault()
    const androidChecked = this.element.querySelector('input[name="pass_template_pair[android_pass_template_id]"]:checked')
    const iosChecked = this.element.querySelector('input[name="pass_template_pair[ios_pass_template_id]"]:checked')
    
    // Only open modal if both Android and iOS templates are selected
    if (androidChecked && iosChecked) {
      this.modalTarget.classList.remove('hidden')
    }
  }

  closeModal(event) {
    event.preventDefault()
    this.modalTarget.classList.add('hidden')
  }
};
