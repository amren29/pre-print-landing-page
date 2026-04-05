import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["item", "panel", "description", "asset"]

  connect() {
    this.panelAnimationDuration = 1000
    this.assetRestoreDuration = 500
    this.currentIndex = this.itemTargets.findIndex((item) => "open" in item.dataset)

    if (this.currentIndex === -1) {
      this.currentIndex = 0
    }

    this.handleResize = this.handleResize.bind(this)
    window.addEventListener("resize", this.handleResize)

    this.updateDescriptionHeights()
    this.updatePanels()
  }

  disconnect() {
    window.removeEventListener("resize", this.handleResize)

    if (this.assetScaleTimeout) {
      window.clearTimeout(this.assetScaleTimeout)
    }
  }

  select(event) {
    const item = event.currentTarget
    const index = parseInt(item.dataset.index, 10)

    if (index === this.currentIndex) {
      return
    }
    
    // Update active item
    this.itemTargets.forEach((el, i) => {
      if (i === index) {
        el.dataset.open = ""
      } else {
        delete el.dataset.open
      }
    })

    this.currentIndex = index
    this.updateDescriptionHeights()
    this.animatePanels()
    this.updatePanels()
  }

  handleResize() {
    this.updateDescriptionHeights()
  }

  updateDescriptionHeights() {
    this.descriptionTargets.forEach((description, index) => {
      const nextHeight = index === this.currentIndex ? `${description.scrollHeight}px` : "0px"
      description.style.height = nextHeight
    })
  }

  animatePanels() {
    if (this.assetScaleTimeout) {
      window.clearTimeout(this.assetScaleTimeout)
    }

    this.assetTargets.forEach((asset) => {
      asset.classList.remove("duration-200", "ease-out-cubic", "scale-100")
      asset.classList.add("duration-300", "ease-in-cubic", "scale-[0.98]")
    })

    this.assetScaleTimeout = window.setTimeout(() => {
      this.assetTargets.forEach((asset) => {
        asset.classList.remove("duration-300", "ease-in-cubic", "scale-[0.98]")
        asset.classList.add("duration-400", "ease-out-cubic", "scale-100")
      })
    }, this.panelAnimationDuration - this.assetRestoreDuration)
  }

  updatePanels() {
    const allTranslateClasses = ["translate-y-0", "-translate-y-full", "translate-y-full", "-translate-y-[200%]", "translate-y-[200%]"]
    
    this.panelTargets.forEach((panel, i) => {
      panel.classList.remove(...allTranslateClasses)
      
      const distance = i - this.currentIndex
      
      if (distance === 0) {
        panel.classList.add("translate-y-0")
      } else if (distance < -1) {
        panel.classList.add("-translate-y-[200%]")
      } else if (distance === -1) {
        panel.classList.add("-translate-y-full")
      } else if (distance === 1) {
        panel.classList.add("translate-y-full")
      } else {
        panel.classList.add("translate-y-[200%]")
      }
    })
  }
};
