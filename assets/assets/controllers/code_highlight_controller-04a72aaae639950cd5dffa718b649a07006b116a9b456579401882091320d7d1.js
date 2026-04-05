import { Controller } from "@hotwired/stimulus"
import { getHighlighter } from "shiki-es";

export default class extends Controller {
  static targets = ["codeSample"]

  connect() {
    this.highlightSamples()
  }

  copyToClipboard(event) {
    const codeContent = this.codeSampleTarget.innerText;
    
    // Use modern clipboard API with fallback
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codeContent);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = codeContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    // Cross-fade icons (they're stacked via CSS grid)
    const container = event.currentTarget;
    const icons = container.querySelectorAll('svg');
    const copyIcon = icons[0];
    const checkmarkIcon = icons[1];

    if (!copyIcon || !checkmarkIcon) return;

    // Ensure transitions are set
    copyIcon.style.transition = 'opacity 150ms ease-out';
    checkmarkIcon.style.transition = 'opacity 150ms ease-out';

    // Fade out copy, fade in checkmark
    copyIcon.style.opacity = '0';
    checkmarkIcon.style.opacity = '1';

    // Clear any existing timeout
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }

    // After 2 seconds, fade back
    this.resetTimeout = setTimeout(() => {
      copyIcon.style.opacity = '1';
      checkmarkIcon.style.opacity = '0';
    }, 2000);
  }

  async highlightSamples() {
    let highlighter = await getHighlighter({
      theme: "min-light",
      langs: ["shell", "ruby", "javascript", "python", "go", "csharp", "java", "php"],
    });

    // Use stored sample if available, otherwise save and use innerHTML
    let sample = this.codeSampleTarget.getAttribute('data-sample');
    if (!sample) {
      sample = this.codeSampleTarget.innerHTML;
      this.codeSampleTarget.setAttribute('data-sample', sample);
    }

    this.codeSampleTarget.innerHTML = highlighter.codeToHtml(
      sample.replace(/&gt;/g, ">").replace(/&lt;/g, "<"),
      {
        lang: this.codeSampleTarget.getAttribute('lang'),
      },
    );
  }
};
