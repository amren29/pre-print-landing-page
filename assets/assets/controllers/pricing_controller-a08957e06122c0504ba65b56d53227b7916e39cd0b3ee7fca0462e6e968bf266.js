import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "cardQuantity",
    "cardTotal",
    "hidQuantity",
    "hidTotal",
    "desQuantity",
    "desTotal",
    "total",
    "hidTotalAmount",
    "desTotalAmount",
    "totalAmount",
    "signupLink",
    "hidInput",
    "desInput",
    "hidErrorMessage",
    "desErrorMessage"
  ]

  static values = {
    platformFee: { type: Number, default: 0 },
    cardFee: { type: Number, default: 0 },
    cardMin: { type: Number, default: 0 },
    hidFee: { type: Number, default: 0 },
    hidMin: { type: Number, default: 0 },
    desFee: { type: Number, default: 0 },
    desMin: { type: Number, default: 0 }
  }

  connect() {
    this.errorHideTimeouts = { hid: null, des: null };
    this.cardQuantity = this.cardMinValue;
    this.hidQuantity = this.hidMinValue;
    this.desQuantity = this.desMinValue;
    this.update()
  }

  disconnect() {
    this.clearHideErrorTimeout("hid");
    this.clearHideErrorTimeout("des");
  }

  cardChange(event) {
    const value = parseInt(event.target.value, 10) || this.cardMinValue;
    this.cardQuantity = value;
    this.update()
  }

  hidChange(event) {
    this.handleQuantityInput(event.target, "hid");
    this.update()
  }

  hidBlur(event) {
    this.handleQuantityBlur(event.target, "hid");
    this.update()
  }

  desChange(event) {
    this.handleQuantityInput(event.target, "des");
    this.update()
  }

  desBlur(event) {
    this.handleQuantityBlur(event.target, "des");
    this.update()
  }

  update() {
    // Platform
    const platformTotal = this.platformFeeValue;

    // Card template
    const cardQuantity = this.cardQuantity;
    const cardTotal = cardQuantity * this.cardFeeValue;
    this.cardQuantityTargets.forEach((element) => {
      element.innerHTML = cardQuantity;
    });
    this.cardTotalTargets.forEach((element) => {
      element.innerHTML = this.formatNumber(cardTotal);
    });

    // HID
    const hidQuantity = this.hidQuantity;
    const hidTotal = hidQuantity * this.hidFeeValue;
    this.hidQuantityTargets.forEach((element) => {
      element.innerHTML = hidQuantity;
    });
    this.hidTotalTargets.forEach((element) => {
      element.innerHTML = this.formatNumber(hidTotal);
    });
    
    // DES
    const desQuantity = this.desQuantity;
    const desTotal = desQuantity * this.desFeeValue;
    this.desQuantityTargets.forEach((element) => {
      element.innerHTML = desQuantity;
    });
    this.desTotalTargets.forEach((element) => {
      element.innerHTML = this.formatNumber(desTotal);
    });

    // Total
    const total = platformTotal + cardTotal + hidTotal + desTotal;
    this.totalTargets.forEach((element) => {
      element.innerHTML = this.formatNumber(total);
    })

    this.updateValidationState();
    this.updateSignupLink();
  }

  updateSignupLink() {
    if (!this.hasSignupLinkTarget) return;

    const pricing = {};

    if (this.platformFeeValue > 0) {
      pricing.platform = 1;
    }
    if (this.cardFeeValue > 0) {
      pricing.card = this.cardQuantity;
    }
    if (this.hidFeeValue > 0) {
      pricing.hid = this.hidQuantity;
    }
    if (this.desFeeValue > 0) {
      pricing.des = this.desQuantity;
    }

    const encodedPricing = btoa(JSON.stringify(pricing));
    const url = new URL(this.signupLinkTarget.href, window.location.origin);
    url.searchParams.set("pricing", encodedPricing);
    this.signupLinkTarget.href = url.pathname + url.search;
  }

  handleQuantityInput(input, type) {
    this.sanitizeNumericInput(input);
    this.setQuantity(type, this.parseQuantity(input));

    if (!this.quantityInvalid(type)) {
      this.hideQuantityError(type);
    }
  }

  handleQuantityBlur(input, type) {
    if (input.value === "") {
      input.value = "0";
    }

    this.sanitizeNumericInput(input);
    this.setQuantity(type, this.parseQuantity(input));

    if (this.quantityInvalid(type)) {
      this.showQuantityError(type);
    } else {
      this.hideQuantityError(type);
    }
  }

  sanitizeNumericInput(input) {
    const value = input.value;
    const cursor = input.selectionStart ?? value.length;
    const digitsOnly = value.replace(/\D+/g, "");
    const normalizedDigits = digitsOnly.replace(/^0+(?=\d)/, "");

    if (normalizedDigits === value) return;

    const digitsBeforeCursor = value.slice(0, cursor).replace(/\D+/g, "");
    const normalizedBeforeCursor = digitsBeforeCursor.replace(/^0+(?=\d)/, "");
    input.value = normalizedDigits;

    if (document.activeElement === input && typeof input.setSelectionRange === "function") {
      const position = normalizedBeforeCursor.length;
      input.setSelectionRange(position, position);
    }
  }

  parseQuantity(input) {
    if (input.value === "") return 0;

    const parsed = parseInt(input.value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  setQuantity(type, value) {
    if (type === "hid") {
      this.hidQuantity = value;
      return;
    }

    this.desQuantity = value;
  }

  quantityInvalid(type) {
    if (type === "hid") {
      return this.hidQuantity < this.hidMinValue;
    }

    return this.desQuantity < this.desMinValue;
  }

  anyInvalidQuantity() {
    return this.hidInvalid() || this.desInvalid();
  }

  hidInvalid() {
    return this.hasHidInputTarget && this.hidQuantity < this.hidMinValue;
  }

  desInvalid() {
    return this.hasDesInputTarget && this.desQuantity < this.desMinValue;
  }

  updateValidationState() {
    const hidInvalid = this.hidInvalid();
    const desInvalid = this.desInvalid();
    const anyInvalid = hidInvalid || desInvalid;

    this.setInvalidState(this.hidTotalAmountTargets, hidInvalid);
    this.setInvalidState(this.desTotalAmountTargets, desInvalid);
    this.setInvalidState(this.totalAmountTargets, anyInvalid);

    this.setSignupDisabled(anyInvalid);
  }

  setInvalidState(elements, invalid) {
    const value = invalid ? "true" : "false";
    elements.forEach((element) => {
      element.dataset.invalid = value;
    });
  }

  setSignupDisabled(disabled) {
    if (!this.hasSignupLinkTarget) return;

    if (disabled) {
      this.signupLinkTarget.setAttribute("data-disabled", "true");
      this.signupLinkTarget.classList.add("is-disabled");
      return;
    }

    this.signupLinkTarget.removeAttribute("data-disabled");
    this.signupLinkTarget.classList.remove("is-disabled");
  }

  showQuantityError(type) {
    const minValue = type === "hid" ? this.hidMinValue : this.desMinValue;
    const kind = type === "hid" ? "HID passes" : "DESFire passes";
    const target = type === "hid" ? this.hidErrorMessageTarget : this.desErrorMessageTarget;
    const hiddenClass = this.errorHiddenClass();

    this.clearHideErrorTimeout(type);
    target.textContent = `Minimum for ${kind} is ${this.formatNumber(minValue)}`;
    target.classList.remove(hiddenClass);
  }

  hideQuantityError(type) {
    const target = type === "hid" ? this.hidErrorMessageTarget : this.desErrorMessageTarget;
    const hiddenClass = this.errorHiddenClass();

    target.classList.add(hiddenClass);
    this.clearHideErrorTimeout(type);

    this.errorHideTimeouts[type] = window.setTimeout(() => {
      if (target.classList.contains(hiddenClass)) {
        target.textContent = "";
      }
      this.errorHideTimeouts[type] = null;
    }, 300);
  }

  clearHideErrorTimeout(type) {
    const timeout = this.errorHideTimeouts?.[type];
    if (!timeout) return;

    clearTimeout(timeout);
    this.errorHideTimeouts[type] = null;
  }

  errorHiddenClass() {
    return "-translate-y-[calc(100%+9px)]";
  }

  formatNumber(num) {
    return num.toLocaleString("en-US")
  }
};
