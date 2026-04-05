import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["accountList", "accountInput", "container"]

  connect() {
    // Store the original list for reference
    this.originalList = this.accountList()
    
    // Bind the clickOutside method to this instance
    this.clickOutsideHandler = this.clickOutside.bind(this)
  }

  showList(event) {
    event.preventDefault()
    this.containerTarget.classList.remove('hidden')
    
    // Add click outside listener
    setTimeout(() => {
      document.addEventListener('click', this.clickOutsideHandler)
    }, 500)
  }

  clickOutside(event) {
    if (!this.containerTarget.contains(event.target)) {
      this.hideList()
    }
  }

  hideList() {
    this.containerTarget.classList.add('hidden')
    // Clean up event listener
    document.removeEventListener('click', this.clickOutsideHandler)
  }

  generateMatchList() {
    const searchTerm = this.accountInputTarget.value.toLowerCase().trim()
    const accounts = this.originalList
    
    if (!searchTerm) {
      this.showAllAccounts()
      return
    }

    accounts.forEach(account => {
      const accountName = account.value.toLowerCase().trim()
      const accountItem = account.closest('li')

      if (accountName.includes(searchTerm)) {
        accountItem.classList.remove('hidden')
      } else {
        accountItem.classList.add('hidden')
      }
    })
  }

  accountList() {
    return Array.from(this.accountListTarget.querySelectorAll('input[type="submit"]'))
  }

  showAllAccounts() {
    this.accountListTarget.querySelectorAll('li').forEach(item => {
      item.classList.remove('hidden')
    })
  }

  disconnect() {
    // Clean up event listener when controller is disconnected
    document.removeEventListener('click', this.clickOutsideHandler)
  }
};
