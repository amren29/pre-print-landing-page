import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["content", "chevron"]

  connect() {
    this.isExpanded = false;
    this.contentHeight = null;
    this.openTimeout = null;

    this.updateUi();
  }

  toggle(event) {
    event.preventDefault()
    this.isExpanded = !this.isExpanded;

    this.updateUi();
  }

  updateUi() {
    if (this.openTimeout) {
      clearTimeout(this.openTimeout);
      this.openTimeout = null;
    }

    if (this.isExpanded) {
      this.contentTarget.style.setProperty('--accordion-content-height', `${this.contentTarget.scrollHeight}px`);
      this.chevronTarget.dataset.open = true;

      this.openTimeout = setTimeout(() => {
        this.contentTarget.style.setProperty('--accordion-content-height', `auto`);
      }, 500)
    } else {
      this.contentTarget.style.setProperty('--accordion-content-height', `${this.contentTarget.scrollHeight}px`);
      delete this.chevronTarget.dataset.open;

      requestAnimationFrame(() => {
        this.contentTarget.style.setProperty('--accordion-content-height', `0px`);
      })
    }
  }
};
