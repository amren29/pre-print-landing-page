import { Controller } from "@hotwired/stimulus"

const STEP_SIZE = 80
const DEFAULT_INDEX = 1
const TOUCH_INDEX = 3
const FINAL_INDEX = 4
const PAID_REVEAL_LEAD = 140

export default class extends Controller {
  static targets = ["box", "item", "number", "paid", "strip"]

  static values = {
    stepDuration: Number,
    labelDelay: Number,
  }

  connect() {
    this.timeouts = []
    this.currentIndex = DEFAULT_INDEX
    this.isHovering = false
    this.isTouchDevice = window.matchMedia("(hover: none)").matches

    if (this.isTouchDevice) {
      this.applyState(TOUCH_INDEX)
      return
    }

    this.applyState(DEFAULT_INDEX)
  }

  disconnect() {
    this.clearQueue()
  }

  hover() {
    if (this.isTouchDevice) return

    this.clearQueue()
    this.isHovering = true

    if (this.currentIndex >= FINAL_INDEX) return

    this.startSequence()
  }

  leave() {
    if (this.isTouchDevice) return

    this.clearQueue()
    this.isHovering = false
    this.applyState(DEFAULT_INDEX)
  }

  startSequence() {
    let delay = 0

    for (let nextIndex = this.currentIndex + 1; nextIndex <= FINAL_INDEX; nextIndex += 1) {
      this.queue(() => {
        if (!this.isHovering) return

        this.moveBoxTo(nextIndex)
        this.updateNumberStates(nextIndex)
        this.updatePaidStates(nextIndex, { revealCurrent: false })
      }, delay)

      this.queue(() => {
        if (!this.isHovering) return

        this.updatePaidStates(nextIndex, { revealCurrent: true })
      }, Math.max(0, delay + this.stepDuration - PAID_REVEAL_LEAD))

      delay += this.stepDuration + this.labelDelay
    }
  }

  applyState(index) {
    this.moveBoxTo(index)
    this.updateNumberStates(index)
    this.updatePaidStates(index, { revealCurrent: true })
  }

  moveBoxTo(index) {
    this.currentIndex = index
    this.boxTarget.style.transform = `translateX(${index * STEP_SIZE}px)`
  }

  updateNumberStates(index) {
    this.numberTargets.forEach((number) => {
      const numberIndex = Number(number.dataset.index)
      number.classList.toggle("is-active", numberIndex === index)
    })
  }

  updatePaidStates(index, { revealCurrent }) {
    this.paidTargets.forEach((paid) => {
      const paidIndex = Number(paid.dataset.index)
      const state = this.paidStateForIndex(paidIndex, index, revealCurrent)

      paid.classList.toggle("is-hidden", state === "hidden")
      paid.classList.toggle("is-dim", state === "dim")
      paid.classList.toggle("is-full", state === "full")
    })
  }

  paidStateForIndex(itemIndex, activeIndex, revealCurrent) {
    if (itemIndex === 0) return "dim"
    if (itemIndex < activeIndex) return "dim"
    if (itemIndex === activeIndex) return revealCurrent ? "full" : "hidden"
    return "hidden"
  }

  queue(callback, delay) {
    const timeout = window.setTimeout(callback, delay)
    this.timeouts.push(timeout)
  }

  clearQueue() {
    this.timeouts.forEach((timeout) => {
      window.clearTimeout(timeout)
    })

    this.timeouts = []
  }

  get stepDuration() {
    return this.stepDurationValue || 220
  }

  get labelDelay() {
    return this.labelDelayValue || 100
  }
};
