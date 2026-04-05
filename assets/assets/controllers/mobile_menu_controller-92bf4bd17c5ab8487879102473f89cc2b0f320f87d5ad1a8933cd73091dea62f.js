import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["header"]

  connect() {
    this.open = false;
    this.activeSubmenu = null;
    this.update();
  }

  toggleOpen() {
    this.open = !this.open;
    this.activeSubmenu = null;
    this.update();
  }

  openDevelopers() {
    this.activeSubmenu = "developers";
    this.update();
  }

  openPricing() {
    this.activeSubmenu = "pricing";
    this.update();
  }

  closeSubmenu() {
    this.activeSubmenu = null;
    this.update();
  }

  update() {
    if (this.open) {
      this.headerTarget.setAttribute("data-open", "");
    } else {
      this.headerTarget.removeAttribute("data-open");
    }
    
    if (this.activeSubmenu) {
      this.headerTarget.setAttribute("data-submenu", this.activeSubmenu);
    } else {
      this.headerTarget.removeAttribute("data-submenu");
    }
  }
}
;
