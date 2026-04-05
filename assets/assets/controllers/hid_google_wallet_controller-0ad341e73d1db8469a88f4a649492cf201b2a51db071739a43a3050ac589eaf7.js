import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="hid-google-wallet"
export default class extends Controller {
  static targets = ["installButton"]
  
  async openGoogleWallet(event) {
    event.preventDefault()
    
    try {
      // Get data from the button's dataset
      const requestData = {
        issuanceToken: this.installButtonTarget.dataset.iToken,
        walletType: "GOOGLE_WALLET",
        googleWallet: {
          idToken: this.installButtonTarget.dataset.gidToken,
          accessToken: this.installButtonTarget.dataset.aToken
        }
      }
      
      // POST to the Rails endpoint
      const response = await fetch(event.currentTarget.href, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      const data = await response.json()
      
      // Build Google Wallet URL with the blob
      const blob = data.provisioningData.googleWallet.blob
      const googleWalletUrl = `https://pay.google.com/gp/t/savecard/${blob}?provisioning_source=web`
      
      // Open in new tab
      window.open(googleWalletUrl, '_blank')
      
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to open Google Wallet")
    }
  }
};
