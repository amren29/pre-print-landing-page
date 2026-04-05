import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["digit", "hiddenCode", "submitButton"]

  connect() {
    this.digitTargets[0]?.focus()
  }

  handleInput(event) {
    const input = event.target
    const value = input.value

    if (!/^\d$/.test(value)) {
      input.value = ""
      return
    }

    const currentIndex = this.digitTargets.indexOf(input)
    
    if (currentIndex < this.digitTargets.length - 1) {
      this.digitTargets[currentIndex + 1].focus()
    }

    this.updateHiddenCode()

    if (this.isComplete()) {
      this.submitForm()
    }
  }

  handleKeydown(event) {
    const input = event.target
    const currentIndex = this.digitTargets.indexOf(input)

    if (event.key === "Backspace") {
      if (input.value === "" && currentIndex > 0) {
        this.digitTargets[currentIndex - 1].focus()
        this.digitTargets[currentIndex - 1].value = ""
      } else {
        input.value = ""
      }
      this.updateHiddenCode()
      event.preventDefault()
    } else if (event.key === "ArrowLeft" && currentIndex > 0) {
      this.digitTargets[currentIndex - 1].focus()
      event.preventDefault()
    } else if (event.key === "ArrowRight" && currentIndex < this.digitTargets.length - 1) {
      this.digitTargets[currentIndex + 1].focus()
      event.preventDefault()
    }
  }

  handlePaste(event) {
    event.preventDefault()
    const pastedData = (event.clipboardData || window.clipboardData).getData("text")
    const digits = pastedData.replace(/\D/g, "").slice(0, 6)

    if (digits.length === 0) return

    digits.split("").forEach((digit, index) => {
      if (this.digitTargets[index]) {
        this.digitTargets[index].value = digit
      }
    })

    const lastFilledIndex = Math.min(digits.length - 1, this.digitTargets.length - 1)
    this.digitTargets[lastFilledIndex]?.focus()

    this.updateHiddenCode()
  }

  updateHiddenCode() {
    const code = this.digitTargets.map(input => input.value).join("")
    this.hiddenCodeTarget.value = code
  }

  isComplete() {
    return this.digitTargets.every(input => /^\d$/.test(input.value))
  }

  submitForm() {
    this.updateHiddenCode()
    this.element.requestSubmit()
  }
};
