import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["trigger", "request", "response"]
  static values = { base: String }

  copy() {
    const text = this.buildLlmText()
    navigator.clipboard.writeText(text)

    this.triggerTarget.setAttribute("data-copied", "")

    if (this.resetTimer) {
      clearTimeout(this.resetTimer)
    }

    this.resetTimer = setTimeout(() => {
      this.triggerTarget.removeAttribute("data-copied")
    }, 2000)
  }

  buildLlmText() {
    const parts = [this.baseValue]

    // Get active request code sample
    const activeRequest = this.requestTargets.find(el => {
      const active = el.getAttribute("data-active")
      return active === "true" || active === true
    })
    
    if (activeRequest) {
      const codeEl = activeRequest.querySelector("[data-code-highlight-target='codeSample']")
      if (codeEl) {
        const lang = activeRequest.getAttribute("data-language") || "text"
        parts.push("")
        parts.push("### Example Request")
        parts.push("")
        parts.push("```" + lang)
        parts.push(codeEl.textContent.trim())
        parts.push("```")
      }
    }

    // Get response code sample
    if (this.hasResponseTarget) {
      const codeEl = this.responseTarget.querySelector("[data-code-highlight-target='codeSample']")
      if (codeEl) {
        parts.push("")
        parts.push("### Example Response")
        parts.push("")
        parts.push("```json")
        parts.push(codeEl.textContent.trim())
        parts.push("```")
      }
    }

    return parts.join("\n")
  }

  disconnect() {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer)
    }
  }
}
;
