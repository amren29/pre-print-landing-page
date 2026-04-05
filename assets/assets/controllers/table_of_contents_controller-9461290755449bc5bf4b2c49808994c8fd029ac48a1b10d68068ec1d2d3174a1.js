import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["grid", "content", "section", "item", "list"]
  static values = { margin: { type: Number, default: 100 } }

  connect() {
    this.observer = null
    this.activeSectionId = null
    this.intersectingSections = {}
    this.setupIntersectionObserver()
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }

  toggle() {
    const grid = this.gridTarget
    
    // Toggle data-hidden attribute
    if (grid.hasAttribute("data-hidden")) {
      grid.removeAttribute("data-hidden")
    } else {
      grid.setAttribute("data-hidden", "")
    }
  }

  setupIntersectionObserver() {
    if (!this.hasContentTarget) return

    this.sectionTargets.forEach((section) => {
      const id = section.getAttribute("data-section-id")
      if (!id) return

      this.intersectingSections[id] = false
    })

    const options = {
      root: null,
      rootMargin: `-${this.marginValue}px 0px -${this.marginValue}px 0px`,
      threshold: 0
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        const id = target.getAttribute("data-section-id")
        if (!id) return

        this.intersectingSections[id] = isIntersecting
      })

      this.updateActiveSection()
    }, options)

    this.sectionTargets.forEach((section) => {
      this.observer.observe(section)
    })
  }

  updateActiveSection() {
    const intersectingSections = this.sectionTargets.filter((section) => {
      const id = section.getAttribute("data-section-id")
      return id && this.intersectingSections[id]
    })

    if (intersectingSections.length === 0) return

    const margin = this.marginValue
    const sectionsAboveMargin = intersectingSections.filter(
      (section) => section.getBoundingClientRect().top <= margin
    )

    const activeSection = sectionsAboveMargin.length > 0
      ? sectionsAboveMargin.reduce((closest, current) => {
          return current.getBoundingClientRect().top > closest.getBoundingClientRect().top ? current : closest
        })
      : intersectingSections.reduce((closest, current) => {
          return current.getBoundingClientRect().top < closest.getBoundingClientRect().top ? current : closest
        })

    const activeSectionId = activeSection.getAttribute("data-section-id")
    if (!activeSectionId || activeSectionId === this.activeSectionId) return

    this.activeSectionId = activeSectionId
    this.showActiveEntry()
  }

  showActiveEntry() {
    const activeSectionId = this.activeSectionId
    if (!activeSectionId) return

    this.itemTargets.forEach((element) => {
      const id = element.getAttribute("data-section-id")
      element.setAttribute("data-active", id === activeSectionId)
    })
  }
};
