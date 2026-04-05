import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["select", "downloadLink"]

  connect() {
    // Initialize the download link with the current selected value
    this.updateDownloadLink()
  }

  updateDownloadLink() {
    const selectedOption = this.selectTarget.value
    const [month, year] = selectedOption.split(", ")
    
    // Convert month name to number (1-12) and pad with zero if needed
    const monthNumber = (new Date(`${month} 1, ${year}`).getMonth() + 1).toString().padStart(2, '0')
    
    // Update the href with the selected month and year
    this.downloadLinkTarget.href = `/billing/invoice/statement-${monthNumber}-${year}.pdf`
  }
};
