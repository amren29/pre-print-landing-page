import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="plan-selector"
export default class extends Controller {
  static targets = ["planType", "planName"]
  
  connect() {
    // Initialize plan names based on default plan type if present
    if (this.hasPlanTypeTarget && this.planTypeTarget.value) {
      this.updatePlanNames();
    }
  }
  
  updatePlanNames() {
    if (!this.hasPlanNameTarget) return;
    
    // Clear existing options
    this.planNameTarget.innerHTML = "";
    
    const planType = this.planTypeTarget.value.toLowerCase();
    
    // Early return if no plan type selected
    if (!planType) return;
    
    // Add default empty option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a plan";
    this.planNameTarget.appendChild(defaultOption);
    
    // Get plan names based on selected plan type
    let planNames = [];
    
    if (planType === "cloud") {
      planNames = ["business", "enterprise"];
    } else if (planType === "on_prem") {
      planNames = ["standard"];
    }
    
    // Create and append options
    planNames.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      this.planNameTarget.appendChild(option);
    });
    
    // Trigger change to update any dependent elements
    this.planNameTarget.dispatchEvent(new Event("change"));
  }
};
