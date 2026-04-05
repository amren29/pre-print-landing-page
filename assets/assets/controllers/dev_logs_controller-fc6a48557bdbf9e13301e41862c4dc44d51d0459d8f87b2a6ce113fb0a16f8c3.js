import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
  	console.log('dev logs linked up')
  }

  navigate(e) {
    e.preventDefault()
    window.location = e.target.closest('tr').dataset.url
  }
}
;
