// app/javascript/controllers/language_selector_controller.js
import { Controller } from "@hotwired/stimulus"
export default class extends Controller {
  static targets = ["language", "sample", "mobileSelect", "icon"]
  
  connect() {
    this.activeLanguage = this.getStoredPreference()

    if (!this.activeLanguage) {
      this.activeLanguage = this.languageTargets[0].dataset.language
    }

    this.updateData()
  }

  select(event) {
    const newLanguage = event.currentTarget.dataset.language
    if (newLanguage === this.activeLanguage) return

    this.withSectionScroll(() => {
      this.activeLanguage = newLanguage
      this.storePreference(newLanguage)
      this.updateData()
    })
  }

  selectMobile(event) {
    const newLanguage = event.currentTarget.value
    if (newLanguage === this.activeLanguage) return

    this.activeLanguage = newLanguage
    this.storePreference(newLanguage)
    this.updateData()
  }

  updateData() {
    this.languageTargets.forEach((element) => {
      const language = element.getAttribute("data-language")
      element.setAttribute("data-active", language === this.activeLanguage)
    })

    this.sampleTargets.forEach((element) => {
      const language = element.getAttribute("data-language")
      element.setAttribute("data-active", language === this.activeLanguage)
    })

    this.mobileSelectTarget.value = this.activeLanguage

    this.iconTargets.forEach((element) => {
      const language = element.getAttribute("data-language")
      element.setAttribute("data-active", language === this.activeLanguage)
    })
  }

  storePreference(language) {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)
    
    document.cookie = `preferredLanguage=${language}; expires=${expiryDate.toUTCString()}; path=/`
  }

  getStoredPreference() {
    const cookieName = 'preferredLanguage'
    const match = document.cookie.match(new RegExp(`(^| )${cookieName}=([^;]+)`))
    if (match) {
      return match[2]
    }
    return null
  }

  withSectionScroll(callback) {
    const sectionId = this.currentActiveSectionId()

    callback()

    if (!sectionId) return

    requestAnimationFrame(() => {
      this.scrollToSectionTop(sectionId)
    })
  }

  currentActiveSectionId() {
    return this.element.querySelector("[data-table-of-contents-target='item'][data-active='true']")?.getAttribute("data-section-id")
  }

  scrollToSectionTop(sectionId) {
    const target = document.getElementById(sectionId) || this.element.querySelector(`[data-table-of-contents-target='section'][data-section-id='${sectionId}']`)
    if (!target) return

    target.scrollIntoView({
      block: "start",
      behavior: "auto"
    })
  }
};
