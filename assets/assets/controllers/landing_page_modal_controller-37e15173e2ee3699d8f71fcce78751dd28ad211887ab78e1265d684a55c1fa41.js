import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["popover"]

  open(event) {
    event.preventDefault();
    this.popoverTarget.classList.toggle("hidden");
  }

  close(event) {
    event.preventDefault();
    this.popoverTarget.classList.toggle("hidden");
  }
};
