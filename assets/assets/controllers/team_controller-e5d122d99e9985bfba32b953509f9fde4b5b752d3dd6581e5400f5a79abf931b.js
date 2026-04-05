// app/javascript/controllers/pass_preview_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["userForm", "teamForm"]

  toggleTeamForm(event) {
    event.preventDefault();
    this.teamFormTarget.classList.toggle("hidden");
  }

  toggleUserForm(event) {
    event.preventDefault();
    this.userFormTarget.classList.toggle("hidden");
  }

  copyLink(event) {
    event.preventDefault();
    const url = window.location.href;
    
    navigator.clipboard.writeText(url)
    alert('Copied!')
  }
};
