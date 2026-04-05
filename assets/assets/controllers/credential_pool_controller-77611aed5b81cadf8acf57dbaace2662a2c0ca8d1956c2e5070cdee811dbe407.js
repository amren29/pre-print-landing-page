// app/javascript/controllers/credential_pool_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["bitFormatDetailsForm"];

  selected(event) {
    const frame = this.bitFormatDetailsFormTarget;
    frame.src = `/console/credential_pools/${event.target.value}/form`;
    frame.reload();
  }
};
