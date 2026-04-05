import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    // Initialize all answers to have height: 0 and overflow: hidden
    this.element.querySelectorAll('.answer').forEach(answer => {
      // Remove the hidden class as we'll control visibility with height
      answer.classList.remove('hidden');
      
      // Set initial styles for the collapsed state
      answer.style.maxHeight = '0';
      answer.style.overflow = 'hidden';
      answer.style.transition = 'max-height 0.3s ease-out';
      answer.style.display = 'block';
    });
  }
  
  toggle(event) {
    event.preventDefault();
    
    // Get the parent list item
    const listItem = event.currentTarget.closest('li');
    
    // Find the answer paragraph within this list item
    const answer = listItem.querySelector('.answer');
    
    // Find the plus/x icon
    const icon = event.currentTarget.querySelector('.plus-or-x');
    
    // Toggle the answer visibility with animation
    if (answer.style.maxHeight === '0px' || answer.style.maxHeight === '0') {
      // Show the answer with slide-down animation
      answer.style.maxHeight = `${answer.scrollHeight}px`;
      
      // Rotate the icon to 0 degrees (from 45)
      icon.style.transform = 'rotate(0deg)';
      icon.style.transition = 'transform 0.3s ease';
    } else {
      // Hide the answer with slide-up animation
      answer.style.maxHeight = '0';
      
      // Rotate back to plus (45 degrees)
      icon.style.transform = 'rotate(45deg)';
    }
  }
};
