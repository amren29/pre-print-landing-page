// app/javascript/controllers/reader_config_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["configDetailsForm", "templateDropdown", "selectedTemplatesDisplay", "templateSelector", "templateSelectorBox"];

  connect() {
    this.updateSelectedTemplatesDisplay();
  }

  selected(event) {
    const frame = this.configDetailsFormTarget;
    frame.src = `/console/reader_configs/${event.target.value}/form`;
    frame.reload();
  }

  toggleTemplateDropdown() {
    this.templateDropdownTarget.classList.toggle('hidden');
  }

  updateSelectedTemplates() {
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (this.hasTemplateSelectorTarget &&
          !this.templateSelectorTarget.contains(event.target)) {
        this.templateDropdownTarget.classList.add('hidden');
      }
    });
    
    this.updateSelectedTemplatesDisplay();
  }

  updateSelectedTemplatesDisplay() {
    if (!this.hasSelectedTemplatesDisplayTarget) return;
    
    const checkboxes = this.templateDropdownTarget.querySelectorAll('input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
      this.selectedTemplatesDisplayTarget.textContent = 'Card Templates';
      
      // Change to dashed border when no templates are selected
      if (this.hasTemplateSelectorBoxTarget) {
        this.templateSelectorBoxTarget.classList.add('border-dashed');
        this.templateSelectorBoxTarget.classList.remove('border-solid');
      }
      return;
    }
    
    const selectedNames = Array.from(checkboxes).map(checkbox => {
      return checkbox.nextElementSibling.textContent.trim();
    });
    
    this.selectedTemplatesDisplayTarget.textContent = selectedNames.join(', ');
    
    // Change to solid border when templates are selected
    if (this.hasTemplateSelectorBoxTarget) {
      this.templateSelectorBoxTarget.classList.remove('border-dashed');
      this.templateSelectorBoxTarget.classList.add('border-solid');
    }
  }
};
