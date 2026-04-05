import { Controller } from "@hotwired/stimulus"
import _ from "lodash"

export default class extends Controller {
  static targets = [
    "frame",
    "apiId",
    "collectorId",
    "keyId",
    "bgColor",
    "primaryLabelColor", 
    "secondaryLabelColor",
    "colorInput",
    "hexInput",
    "fileInputForLogo",
    "fileInputForIcon", 
    "fileInputForBg",
    "uploadTextForLogo",
    "uploadTextForIcon",
    "uploadTextForBg",
    "logoFilename",
    "iconFilename",
    "bgFilename",
    "uploadIconForLogo",
    "uploadIconForIcon",
    "uploadIconForBg",
    "uploadAreaForLogo",
    "uploadAreaForIcon",
    "uploadAreaForBg",
    "uploadStateForLogo",
    "uploadStateForIcon",
    "uploadStateForBg",
    "attachedStateForLogo",
    "attachedStateForIcon",
    "attachedStateForBg",
    "removeFlagForLogo",
    "removeFlagForIcon",
    "removeFlagForBg",
    "fileSizeForLogo",
    "fileSizeForIcon",
    "fileSizeForBg",
    "credentialProfileSelect",
    "landingPageSelect",
    "settingsModal",
    "settingsAssociationFields",
    "smartTapDiv",
    "seosDiv",
    "desfireDiv",
    "landingPageDropdownList",
    "credentialDropdownList",
    "corporateIdRadio",
    "hotelRadio",
    "hotelDiv"
  ]

  connect() {
    this.update = _.debounce(this.performUpdate.bind(this), 500)
    this.closeDropdownsOnOutsideClick = this.closeDropdownsOnOutsideClick.bind(this)
    document.addEventListener("click", this.closeDropdownsOnOutsideClick)
    
    // Add event listener for protocol changes
    this.addProtocolChangeListeners()

    // Sync current association selections into the settings popover form
    this.syncAssociationsToSettingsForm()
  }
  
  disconnect() {
    document.removeEventListener("click", this.closeDropdownsOnOutsideClick)
  }
  
  addProtocolChangeListeners() {
    // Find all protocol radio buttons
    const protocolRadios = this.element.querySelectorAll('input[name="pass_template[protocol]"]')
    
    protocolRadios.forEach(radio => {
      radio.addEventListener('change', this.handleProtocolChange.bind(this))
    })
  }
  
  handleProtocolChange(event) {
    const selectedProtocol = event.target.value
    
    if (selectedProtocol === 'seos') {
      // When HID Seos is selected, disable Hospitality and select Corporate ID
      this.restrictToCorprateIdOnly()
    } else {
      // Re-enable all use case options for other protocols
      this.enableAllUseCases()
    }
  }
  
  restrictToCorprateIdOnly() {
    // Find use case radio buttons
    const corporateIdRadio = this.element.querySelector('input[name="pass_template[use_case]"][value="corporate_id"]')
    const hotelRadio = this.element.querySelector('input[name="pass_template[use_case]"][value="hotel"]')
    
    // Select Corporate ID
    if (corporateIdRadio) {
      corporateIdRadio.checked = true
    }
    
    // Disable Hotel option
    if (hotelRadio) {
      hotelRadio.disabled = true
      
      // Update the visual state of the hotel option
      const hotelLabel = hotelRadio.closest('label')
      if (hotelLabel) {
        const hotelDiv = hotelLabel.querySelector('div')
        if (hotelDiv) {
          // Remove interactive classes
          hotelDiv.classList.remove('bg-blue-50', 'border-blue-400', 'hover:bg-slate-50', 'cursor-pointer')
          // Add disabled classes
          hotelDiv.classList.add('bg-slate-50', 'text-slate-400', 'cursor-not-allowed')
        }
      }
    }
  }
  
  enableAllUseCases() {
    // Find use case radio buttons
    const hotelRadio = this.element.querySelector('input[name="pass_template[use_case]"][value="hotel"]')
    
    // Re-enable Hotel option
    if (hotelRadio) {
      hotelRadio.disabled = false
      
      // Update the visual state of the hotel option
      const hotelLabel = hotelRadio.closest('label')
      if (hotelLabel) {
        const hotelDiv = hotelLabel.querySelector('div')
        if (hotelDiv) {
          // Add interactive classes back
          hotelDiv.classList.add('bg-blue-50', 'border-blue-400', 'hover:bg-slate-50', 'cursor-pointer')
          // Remove disabled classes
          hotelDiv.classList.remove('bg-slate-50', 'text-slate-400', 'cursor-not-allowed')
        }
      }
    }
  }
  
  closeDropdownsOnOutsideClick(event) {
    const cpDropdownArea = this.element.querySelector('[data-action*="click->pass-template-editor#toggleCPDropdown"]')
    const lpDropdownArea = this.element.querySelector('[data-action*="click->pass-template-editor#toggleLPDropdown"]')
    
    if (this.hasCredentialDropdownListTarget && 
        !this.credentialDropdownListTarget.contains(event.target) && 
        (!cpDropdownArea || !cpDropdownArea.contains(event.target))) {
      this.credentialDropdownListTarget.classList.add('hidden')
    }
    
    if (this.hasLandingPageDropdownListTarget && 
        !this.landingPageDropdownListTarget.contains(event.target) && 
        (!lpDropdownArea || !lpDropdownArea.contains(event.target))) {
      this.landingPageDropdownListTarget.classList.add('hidden')
    }
  }

  performUpdate(event) {
    const form = event.target.closest("form")
    const formData = new FormData(form)
    
    // Remove Rails specific fields
    formData.delete('_method')
    formData.delete('authenticity_token')

    // Get CSRF token
    const token = document.querySelector('meta[name="csrf-token"]').content


    // Handle file uploads
    if (event.target.type === "file") {
      const fileType = event.target.name.includes('logo') ? 'Logo' :
                      event.target.name.includes('icon') ? 'Icon' : 'Bg'
      this.handleFilePreview(event.target.files[0], fileType)
    }

    fetch(this.frameTarget.src, {
      method: 'POST',
      body: formData,
      headers: {
        "Accept": "text/vnd.turbo-stream.html",
        "X-CSRF-Token": token
      }
    })
    .then(response => response.text())
    .then(html => {
      Turbo.renderStreamMessage(html)
    })
  }

  handleFilePreview(file, type) {
    if (!file) return

    // Reset the remove flag since we're uploading a new file
    if (this[`hasRemoveFlagFor${type}Target`]) {
      this[`removeFlagFor${type}Target`].value = '0'
    }

    // Update filename in attached state
    if (this[`has${type.toLowerCase()}FilenameTarget`]) {
      this[`${type.toLowerCase()}FilenameTarget`].textContent = file.name
    }

    // Update file size in attached state
    if (this[`hasFileSizeFor${type}Target`]) {
      this[`fileSizeFor${type}Target`].textContent = this.formatFileSize(file.size)
    }

    // Update image preview in attached state
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (this[`hasUploadIconFor${type}Target`]) {
          const currentIcon = this[`uploadIconFor${type}Target`]
          const img = document.createElement('img')
          img.dataset.passTemplateEditorTarget = `uploadIconFor${type}`
          img.src = e.target.result
          img.classList.add('h-8', 'w-8', 'object-contain')
          currentIcon.replaceWith(img)
        }
      }
      reader.readAsDataURL(file)
    }

    // Show attached state, hide upload state
    if (this[`hasAttachedStateFor${type}Target`]) {
      this[`attachedStateFor${type}Target`].classList.remove('hidden')
    }
    if (this[`hasUploadStateFor${type}Target`]) {
      this[`uploadStateFor${type}Target`].classList.add('hidden')
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  updateCredentialProfile(event) {
    const select = event.target
    select.classList.toggle('border-solid', select.value !== 'placeholder')
    this.update(event)
  }

  updateLandingPage(event) {
    const select = event.target
    select.classList.toggle('border-solid', select.value !== 'placeholder')
    this.update(event)
  }

  openSettings(event) {
    event.preventDefault()
    this.syncAssociationsToSettingsForm()
    this.settingsModalTarget.classList.remove('hidden')
  }

  syncAssociationsToSettingsForm() {
    if (!this.hasSettingsAssociationFieldsTarget) return

    const container = this.settingsAssociationFieldsTarget
    container.innerHTML = ""

    // Sync credential profile IDs from main form checkboxes
    if (this.hasCredentialProfileSelectTarget) {
      // Always include an empty value so the key is submitted even when nothing is checked
      const emptyInput = document.createElement("input")
      emptyInput.type = "hidden"
      emptyInput.name = "pass_template[credential_profile_ids][]"
      emptyInput.value = ""
      container.appendChild(emptyInput)

      this.credentialProfileSelectTargets.forEach(checkbox => {
        if (checkbox.checked) {
          const input = document.createElement("input")
          input.type = "hidden"
          input.name = "pass_template[credential_profile_ids][]"
          input.value = checkbox.value
          container.appendChild(input)
        }
      })
    }

    // Sync landing page IDs from main form checkboxes
    if (this.hasLandingPageSelectTarget) {
      const emptyInput = document.createElement("input")
      emptyInput.type = "hidden"
      emptyInput.name = "pass_template[landing_page_ids][]"
      emptyInput.value = ""
      container.appendChild(emptyInput)

      this.landingPageSelectTargets.forEach(checkbox => {
        if (checkbox.checked) {
          const input = document.createElement("input")
          input.type = "hidden"
          input.name = "pass_template[landing_page_ids][]"
          input.value = checkbox.value
          container.appendChild(input)
        }
      })
    }
  }

  closeSettings(event) {
    this.settingsModalTarget.classList.add('hidden')
  }

  toggleDeviceField(event) {
    // Find the parent div that contains the device count fields
    const deviceFields = event.target.closest('.flex').nextElementSibling
    
    // Toggle the hidden class based on checkbox state
    deviceFields.classList.toggle('hidden', !event.target.checked)
    
    // If unchecking, reset the device count fields to 1
    if (!event.target.checked) {
      const form = event.target.closest('form')
      const watchCount = form.querySelector('input[name="pass_template[watch_count]"]')
      const iphoneCount = form.querySelector('input[name="pass_template[iphone_count]"]')
      
      if (watchCount) watchCount.value = 0
      if (iphoneCount) iphoneCount.value = 1
    }
  }

  toggleSmartTap(event) {
    const isAndroid = event.target.value === "android"

    const smartTapRadio = this.smartTapDivTarget.previousElementSibling
    const desfireRadio = this.desfireDivTarget.previousElementSibling

    smartTapRadio.disabled = !isAndroid
    smartTapRadio.checked = isAndroid
    desfireRadio.disabled = isAndroid
    desfireRadio.checked = !isAndroid

    this.smartTapDivTarget.classList.toggle('bg-slate-50', !isAndroid)
    this.smartTapDivTarget.classList.toggle('text-slate-400', !isAndroid)
    this.smartTapDivTarget.classList.toggle('cursor-not-allowed', !isAndroid)
    this.smartTapDivTarget.classList.toggle('bg-blue-50', isAndroid)
    this.smartTapDivTarget.classList.toggle('border', isAndroid)
    this.smartTapDivTarget.classList.toggle('cursor-pointer', isAndroid)
    this.smartTapDivTarget.querySelector('span').classList.toggle('hidden', isAndroid)

    this.desfireDivTarget.classList.toggle('bg-slate-50', isAndroid)
    this.desfireDivTarget.classList.toggle('text-slate-400', isAndroid)
    this.desfireDivTarget.classList.toggle('cursor-not-allowed', isAndroid)
    this.desfireDivTarget.classList.toggle('bg-blue-50', !isAndroid)
    this.desfireDivTarget.classList.toggle('border', !isAndroid)
    this.desfireDivTarget.classList.toggle('cursor-pointer', !isAndroid)
    this.desfireDivTarget.querySelector('span').classList.toggle('hidden', !isAndroid)
  }

  toggleProtocol(event) {
    const selectedProtocol = event.target.value
    
    if (selectedProtocol === 'seos') {
      // Select Corporate ID
      this.corporateIdRadioTarget.checked = true
      
      // Disable Hospitality
      this.hotelRadioTarget.disabled = true
      this.hotelDivTarget.classList.remove('bg-blue-50', 'border-blue-400', 'hover:bg-slate-50', 'cursor-pointer', 'border')
      this.hotelDivTarget.classList.add('bg-slate-50', 'text-slate-400', 'cursor-not-allowed')
    } else {
      // Re-enable Hospitality for other protocols
      this.hotelRadioTarget.disabled = false
      this.hotelDivTarget.classList.add('bg-blue-50', 'border-blue-400', 'hover:bg-slate-50', 'cursor-pointer', 'border')
      this.hotelDivTarget.classList.remove('bg-slate-50', 'text-slate-400', 'cursor-not-allowed')
    }
  }

  toggleLPDropdown(event) {
    const dropdown = this.landingPageDropdownListTarget;
    
    // Toggle visibility
    dropdown.classList.toggle('hidden');
    
    if (!dropdown.classList.contains('hidden')) {
      // Get the position of the toggle button
      const buttonRect = dropdown.getBoundingClientRect();
      
      // Position the dropdown just below the button
      dropdown.style.top = `-${buttonRect.height + 12}px`;
    }
  }

  toggleCPDropdown(event) {
    const dropdown = this.credentialDropdownListTarget;
    
    // Toggle visibility
    dropdown.classList.toggle('hidden');
    
    if (!dropdown.classList.contains('hidden')) {
      // Get the position of the toggle button
      const buttonRect = dropdown.getBoundingClientRect();
      
      // Position the dropdown just below the button
      dropdown.style.top = `-${buttonRect.height + 12}px`;
    }
  }

  removeImage(event) {
    event.preventDefault()
    event.stopPropagation()

    const button = event.currentTarget
    const attachmentType = button.dataset.attachmentType
    const typeMap = { logo: 'Logo', icon: 'Icon', background: 'Bg' }
    const typeSuffix = typeMap[attachmentType]

    // Set the remove flag so the server knows to purge on save
    if (this[`hasRemoveFlagFor${typeSuffix}Target`]) {
      this[`removeFlagFor${typeSuffix}Target`].value = '1'
    }

    // Clear the file input
    if (this[`hasFileInputFor${typeSuffix}Target`]) {
      this[`fileInputFor${typeSuffix}Target`].value = ''
    }

    // Hide the attached state and show the upload state
    if (this[`hasAttachedStateFor${typeSuffix}Target`]) {
      this[`attachedStateFor${typeSuffix}Target`].classList.add('hidden')
    }
    if (this[`hasUploadStateFor${typeSuffix}Target`]) {
      this[`uploadStateFor${typeSuffix}Target`].classList.remove('hidden')
    }

    // Reset the upload area text and icon back to defaults
    if (this[`hasUploadTextFor${typeSuffix}Target`]) {
      this[`uploadTextFor${typeSuffix}Target`].textContent = 'Click to upload'
    }

    // Trigger preview update
    this.triggerPreviewUpdate()
  }

  triggerPreviewUpdate() {
    const form = this.element.querySelector('form')
    if (!form) return

    const formData = new FormData(form)
    formData.delete('_method')
    formData.delete('authenticity_token')

    const token = document.querySelector('meta[name="csrf-token"]').content

    fetch(this.frameTarget.src, {
      method: 'POST',
      body: formData,
      headers: {
        "Accept": "text/vnd.turbo-stream.html",
        "X-CSRF-Token": token
      }
    })
    .then(response => response.text())
    .then(html => {
      Turbo.renderStreamMessage(html)
    })
  }

  copyAPIid(event) {
    event.preventDefault()
    
    // Get the API ID value
    const apiId = this.apiIdTarget.value.trim()
    
    // Copy to clipboard
    navigator.clipboard.writeText(apiId)
    
    // Visual feedback for copy
    const copyIcon = event.currentTarget
    const originalHTML = copyIcon.innerHTML
    
    // Replace with checkmark temporarily
    copyIcon.innerHTML = `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>`
    
    // Reset after animation
    setTimeout(() => {
      copyIcon.innerHTML = originalHTML
    }, 1500)
  }

  copyCollectorId(event) {
    event.preventDefault()
    
    const collectorId = this.collectorIdTarget.value.trim()
    navigator.clipboard.writeText(collectorId)
    
    // Visual feedback for copy
    const copyIcon = event.currentTarget
    const originalHTML = copyIcon.innerHTML
    
    // Replace with checkmark temporarily
    copyIcon.innerHTML = `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>`
    
    // Reset after animation
    setTimeout(() => {
      copyIcon.innerHTML = originalHTML
    }, 1500)
  }
  
  copyKeyId(event) {
    event.preventDefault()
    
    const keyId = this.keyIdTarget.value.trim()
    navigator.clipboard.writeText(keyId)
    
    // Visual feedback for copy
    const copyIcon = event.currentTarget
    const originalHTML = copyIcon.innerHTML
    
    // Replace with checkmark temporarily
    copyIcon.innerHTML = `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>`
    
    // Reset after animation
    setTimeout(() => {
      copyIcon.innerHTML = originalHTML
    }, 1500)
  }
};
