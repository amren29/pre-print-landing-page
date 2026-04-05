import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input"]

  connect() {
    this.syncProgressFromValue()
  }

  inputChange() {
    this.syncProgressFromValue()
  }

  pointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return

    this.pointerId = event.pointerId
    this.element.setPointerCapture(event.pointerId)
    this.inputTarget.focus({ preventScroll: true })
    this.updateValueFromClientX(event.clientX)
    event.preventDefault()
  }

  pointerMove(event) {
    if (event.pointerId !== this.pointerId) return

    this.updateValueFromClientX(event.clientX)
    event.preventDefault()
  }

  pointerUp(event) {
    if (event.pointerId !== this.pointerId) return

    if (this.element.hasPointerCapture(event.pointerId)) {
      this.element.releasePointerCapture(event.pointerId)
    }

    this.pointerId = null
  }

  updateValueFromClientX(clientX) {
    const rect = this.element.getBoundingClientRect()
    const pointerX = clientX - rect.left

    const thumbHalf = this.cssPx("--slider-thumb-width", 2) / 2
    const minX = this.cssPx("--slider-left-gap", 22) + thumbHalf
    const maxX = rect.width - this.cssPx("--slider-right-gap", 8) - thumbHalf
    const clampedX = Math.min(Math.max(pointerX, minX), maxX)
    const progress = (clampedX - minX) / Math.max(maxX - minX, 1)

    const min = Number(this.inputTarget.min)
    const max = Number(this.inputTarget.max)
    const nextValue = Math.round(min + progress * (max - min))

    if (Number(this.inputTarget.value) !== nextValue) {
      this.inputTarget.value = `${nextValue}`
      this.inputTarget.dispatchEvent(new Event("input", { bubbles: true }))
      return
    }

    this.setProgress(progress)
  }

  syncProgressFromValue() {
    const min = Number(this.inputTarget.min)
    const max = Number(this.inputTarget.max)
    const value = Number(this.inputTarget.value)
    const progress = (value - min) / Math.max(max - min, 1)

    this.setProgress(progress)
  }

  setProgress(progress) {
    const clamped = Math.min(Math.max(progress, 0), 1)
    this.element.style.setProperty("--progress", clamped.toString())
  }

  cssPx(variableName, fallback) {
    const value = parseFloat(getComputedStyle(this.element).getPropertyValue(variableName))
    return Number.isFinite(value) ? value : fallback
  }
};
