import { Controller } from "@hotwired/stimulus"
import _ from "lodash"

export default class extends Controller {
  static targets = [
    "frame",
    "fileInput",
    "filename",
    "uploadIcon",
    "uploadText",
    "passwordField",
    "passwordText",
    "passwordInput",
    "passwordToggle",
    "bgColor",
    "colorInput",
    "hexInput",
    "immediateDownloadCheckbox",
    "twoFactorText",
    "twoFactorCheckbox"
  ]

  connect() {
    // Set up debounced update
    this.update = _.debounce(this.performUpdate.bind(this), 500)
  }

  performUpdate(event) {
    const form = event.target.closest("form")
    const formData = new FormData(form)
    // remove garbage
    formData.delete('_method')
    formData.delete('authenticity_token')

    // Get CSRF token from meta tag
    const token = document.querySelector('meta[name="csrf-token"]').content


    // Handle file
    if (event.target.type === "file") {
      this.handleFilePreview(event.target.files[0])
    }

    // Turbo.visit(`${this.frameTarget.src}?${new URLSearchParams(formData)}`, {
    //   frame: this.frameTarget.id,
    //   action: 'replace'
    // })
    fetch(this.frameTarget.src, {
      method: 'POST',
      body: formData,
      headers: {
        "Accept": "text/vnd.turbo-stream.html",
        "X-CSRF-Token": token
      }
    }).then(response => response.text())
      .then(html => {
        Turbo.renderStreamMessage(html)
      })
  }

  handleFilePreview(file) {
    if (!file) return

    // Show filename
    this.filenameTarget.textContent = file.name
    // Update upload text
    this.uploadTextTarget.textContent = "Click to change"

    // Create preview if it's an image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const img = document.createElement('img')
        img.dataset.landingPagePreviewTarget = "uploadIcon"
        img.src = e.target.result
        img.classList.add('h-8', 'w-8', 'object-contain')
        
        // Replace upload icon with preview
        this.uploadIconTarget.replaceWith(img)
      }

      reader.readAsDataURL(file)
    }
  }

  togglePassword(event) {
    if (event.target.checked) {
      this.passwordFieldTarget.classList.remove('hidden')
      this.passwordTextTarget.textContent = "Users must enter a password to install key"
    } else {
      this.passwordFieldTarget.classList.add('hidden')
      this.passwordInputTarget.value = ""
      this.passwordTextTarget.textContent = "Users can install key without a password"
    }

    // Trigger preview update
    this.update(event)
  }

  togglePasswordVisibility(event) {
    event.preventDefault()
    
    if (this.passwordInputTarget.type === "password") {
      this.passwordInputTarget.type = "text"
    } else {
      this.passwordInputTarget.type = "password"
    }
  }

  toggleAllowed(event) {
    if (event.target.checked) {
      this.immediateDownloadCheckboxTarget.value = "1"
    } else {
      this.immediateDownloadCheckboxTarget.value = "0"
    }
  }

  toggle2fa(event) {
    if (event.target.checked) {
      this.twoFactorCheckboxTarget.value = "1"
      this.twoFactorTextTarget.textContent = "Users must verify via SMS before installing key"
    } else {
      this.twoFactorCheckboxTarget.value = "0"
      this.twoFactorTextTarget.textContent = "Users can install key without SMS verification"
    }

    this.update(event)
  }
};
