import { Controller } from "@hotwired/stimulus"
import HelloSign from 'hellosign-embedded';

export default class extends Controller {
  static targets = ["signingURL"]

  // Reset loading state when frame updates
  connect() {
    const client = new HelloSign();

    console.log('url', this.signingURLTarget.dataset.redirect_url)
    client.open(this.signingURLTarget.dataset.url, {
      clientId: 'bd55e1fe97b878d360ff514aee6d46d3',
      skipDomainVerification: true,
      redirectTo: this.signingURLTarget.dataset.redirect_url,
      allowCancel: false, 
      debug: true, 
      timeout: 64800000,
      container: document.getElementById('sign-here')
    });
  }
};
