import { Controller } from "@hotwired/stimulus"

const DIGIT_COUNT = 4
const PRESS_DURATION = 90
const KEY_PRESS_INTERVAL = 270
const INDICATOR_START_DELAY = 100
const BLINK_INTERVAL = 90
const BLINK_STEPS = [
  { at: 0, dim: true },
  { at: BLINK_INTERVAL, dim: false },
  { at: BLINK_INTERVAL * 2, dim: true },
  { at: BLINK_INTERVAL * 3, dim: false },
  { at: BLINK_INTERVAL * 4, dim: true },
  { at: BLINK_INTERVAL * 5, dim: false },
  { at: BLINK_INTERVAL * 6, dim: true },
  { at: BLINK_INTERVAL * 7, dim: false },
]

export default class extends Controller {
  static targets = ["digit", "indicator"]

  connect() {
    this.timeouts = []
  }

  disconnect() {
    this.reset()
  }

  hover() {
    this.reset()
    this.startSequence()
  }

  leave() {
    this.reset()
  }

  startSequence() {
    const digits = this.randomDigits()

    digits.forEach((digit, index) => {
      const startAt = index * KEY_PRESS_INTERVAL

      this.queue(() => {
        digit.classList.add("is-pressed")
      }, startAt)

      this.queue(() => {
        digit.classList.remove("is-pressed")
      }, startAt + PRESS_DURATION)
    })

    const sequenceDuration = digits.length * KEY_PRESS_INTERVAL

    this.queue(() => {
      this.indicatorTargets.forEach((indicator) => {
        indicator.classList.add("is-active")
      })
    }, sequenceDuration + INDICATOR_START_DELAY)

    BLINK_STEPS.forEach(({ at, dim }) => {
      this.queue(() => {
        this.indicatorTargets.forEach((indicator) => {
          indicator.classList.toggle("is-dim", dim)
        })
      }, sequenceDuration + INDICATOR_START_DELAY + at)
    })
  }

  randomDigits() {
    return this.digitTargets
      .filter((digit) => /^\d$/.test(digit.dataset.key || ""))
      .sort(() => Math.random() - 0.5)
      .slice(0, DIGIT_COUNT)
  }

  reset() {
    this.clearQueue()

    this.digitTargets.forEach((digit) => {
      digit.classList.remove("is-pressed")
    })

    this.indicatorTargets.forEach((indicator) => {
      indicator.classList.remove("is-active", "is-dim")
    })
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
};
