import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["developersTrigger", "pricingTrigger", "popup", "developersContent", "pricingContent"]

  connect() {
    this.activeContent = null;
    this.prevActiveContent = null;
    this.setupPopupHover()
  }

  setupPopupHover() {
    if (!this.hasDevelopersTriggerTarget || !this.hasPricingTriggerTarget) return;

    const popup = this.popupTarget;

    const developersButton = this.developersTriggerTarget;
    developersButton.addEventListener('mouseenter', () => {
      this.activeContent = "developers";
      this.updateUi();
    });
    developersButton.addEventListener('mouseleave', (e) => {
      if (popup && popup.contains(e.relatedTarget)) {
        return;
      }

      this.activeContent = null;
      this.updateUi();
    });

    const pricingButton = this.pricingTriggerTarget;
    pricingButton.addEventListener('mouseenter', () => {
      this.activeContent = "pricing";
      this.updateUi();
    });
    pricingButton.addEventListener('mouseleave', (e) => {
      if (popup && popup.contains(e.relatedTarget)) {
        return;
      }

      this.activeContent = null;
      this.updateUi();
    });

    popup.addEventListener('mouseleave', () => {
      this.prevActiveContent = this.activeContent;
      this.activeContent = null;
      this.updateUi();
    });
  }

  updateUi() {
    const popup = this.popupTarget;

    popup.dataset.active = !!this.activeContent;
    
    this.developersContentTargets.forEach((element) => {
      element.dataset.active = this.activeContent === "developers"
    });
    
    this.pricingContentTargets.forEach((element) => {
      element.dataset.active = this.activeContent === "pricing"
    });
  }
};
