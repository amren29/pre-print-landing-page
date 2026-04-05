import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["readerInput", "readerResults"]

  generateMatchList() {
    let userInput = this.readerInputTarget.value.toLowerCase();
    
    // If input empty, show all
    if (userInput.length == 0) {
      this.showAll();
      return;
    }

    // If input is less than 3 characters, dont do anything
    if (userInput.length < 3) {
      return;
    }
    
    let matches = this.brandsWithModels().filter((brand) => this.checkMatch(userInput, brand));
    this.showMatches(matches);
  }

  showAll() {
    const listItems = this.readerResultsTarget.querySelectorAll('li');
    listItems.forEach(item => item.classList.remove('hidden'));
  }

  showMatches(matches) {
    const listItems = this.readerResultsTarget.querySelectorAll('li');
    
    // First hide all items
    listItems.forEach(item => item.classList.add('hidden'));
    
    // Then show only matching brands
    matches.forEach(match => {
      listItems.forEach(item => {
        const brandName = item.querySelector('.brand-name').textContent;
        if (brandName === match.brand) {
          item.classList.remove('hidden');
        }
      });
    });
  }

  checkMatch(string, brandData) {
    const searchStr = string.toLowerCase();
    
    // Check if brand name matches
    if (brandData.brand.toLowerCase().includes(searchStr)) return true;
    
    // Check if any model matches
    return brandData.models.some(model => 
      model.toLowerCase().includes(searchStr)
    );
  }

  brandsWithModels() {
    let data = [];
    const listItems = this.readerResultsTarget.querySelectorAll('li');
    
    listItems.forEach(item => {
      // Get the brand name (first span in the li)
      const brand = item.querySelector('.brand-name').textContent;
      
      // Get all model spans (all spans within the div that has text-slate-700 class)
      const modelElements = item.querySelectorAll('.model-name');
      const models = Array.from(modelElements).map(span => span.innerText);
      
      data.push({
        brand: brand,
        models: models
      });
    });
    
    return data;
  }
};
