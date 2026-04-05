import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "button",
    "loader",
    "successIcon",
    "errorIcon",
    "successMessage",
    "errorMessage",
    "input"
  ]

  static values = {
    action: String
  }

  connect() {
    this.resetTimeout = null
  }

  disconnect() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout)
    }
  }

  // Helper method to simulate API delay for UI testing
  simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async submit(event) {
    event.preventDefault()

    // Hide button with transition classes
    this.buttonTarget.classList.add("opacity-0", "scale-80", "pointer-events-none", "blur-sm")

    // Show loader
    this.loaderTarget.classList.remove("scale-80", "opacity-0", "blur-sm")
    this.loaderTarget.classList.add("scale-100", "opacity-100", "blur-none")

    try {
      const formData = new URLSearchParams()
      formData.append("userGroup", "")
      formData.append("mailingLists", "")
      formData.append("email", this.inputTarget.value)

      const response = await fetch(this.actionValue, {
        method: "POST",
        body: formData.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      if (response.ok) {
        this.showSuccess()
      } else {
        const data = await response.json().catch(() => ({}))
        this.showError(data.message || response.statusText)
      }
    } catch (error) {
      if (error.message === "Failed to fetch") {
        this.showError("Rate limit error")
      } else {
        this.showError(error.message || "Something went wrong")
      }
    }
  }

  showSuccess() {
    // Hide loader
    this.loaderTarget.classList.remove("scale-100", "opacity-100", "blur-none")
    this.loaderTarget.classList.add("scale-80", "opacity-0", "blur-sm")

    // Show success icon
    this.successIconTarget.classList.remove("scale-80", "opacity-0", "blur-sm")
    this.successIconTarget.classList.add("scale-100", "opacity-100", "blur-none")

    // Show success message
    this.successMessageTarget.classList.remove("translate-y-[calc(100%+9px)]", "opacity-0")
    this.successMessageTarget.classList.add("translate-y-0", "opacity-100")

    // Reset form
    this.inputTarget.value = ""

    // Reset after 3 seconds
    this.scheduleReset()
  }

  showError(errorText) {
    // Hide loader
    this.loaderTarget.classList.remove("scale-100", "opacity-100", "blur-none")
    this.loaderTarget.classList.add("scale-80", "opacity-0", "blur-sm")

    // Show error icon with shake animation
    this.errorIconTarget.classList.remove("scale-80", "opacity-0", "blur-sm")
    this.errorIconTarget.classList.add("scale-100", "opacity-100", "blur-none", "guides-subscribe-cross-in")

    // Show error message
    this.errorMessageTarget.textContent = errorText
    this.errorMessageTarget.classList.remove("translate-y-[calc(100%+9px)]", "opacity-0")
    this.errorMessageTarget.classList.add("translate-y-0", "opacity-100")

    // Reset after 3 seconds
    this.scheduleReset()
  }

  scheduleReset() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout)
    }

    this.resetTimeout = setTimeout(() => {
      this.reset()
    }, 3000)
  }

  reset() {
    // Hide success/error icons
    this.successIconTarget.classList.remove("scale-100", "opacity-100", "blur-none")
    this.successIconTarget.classList.add("scale-80", "opacity-0", "blur-sm")

    this.errorIconTarget.classList.remove("scale-100", "opacity-100", "blur-none", "guides-subscribe-cross-in")
    this.errorIconTarget.classList.add("scale-80", "opacity-0", "blur-sm")

    // Hide messages
    this.successMessageTarget.classList.remove("translate-y-0", "opacity-100")
    this.successMessageTarget.classList.add("translate-y-[calc(100%+9px)]", "opacity-0")

    this.errorMessageTarget.classList.remove("translate-y-0", "opacity-100")
    this.errorMessageTarget.classList.add("translate-y-[calc(100%+9px)]", "opacity-0")

    // Show button
    this.buttonTarget.classList.remove("opacity-0", "scale-80", "pointer-events-none", "blur-sm")
  }
};
