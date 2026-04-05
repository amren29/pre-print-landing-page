import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["label", "loader"]
  
  loading() {
    this.element.classList.add("loading")
  }

  // Reset loading state when frame updates
  connect() {
    this.element.classList.remove("loading")
  }
};
