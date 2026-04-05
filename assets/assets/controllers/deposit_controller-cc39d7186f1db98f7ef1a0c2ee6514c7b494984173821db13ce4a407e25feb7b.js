import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "form", 
    "cardSection", 
    "achSection",
    "cardholderName",
    "cardNumber",
    "cardExpiry", 
    "cardCvc",
    "accountName",
    "institutionName",
    "accountNumber",
    "routingNumber",
    "accountType",
    "paymentMethodId",
    "cardBrand"
  ]

  static values = {
    publishableKey: String,
    paymentMethod: { type: String, default: 'card' }
  }

  connect() {
    this.stripe = Stripe(this.publishableKeyValue)
    this.elements = this.stripe.elements()
    this.setupCardElements()
    this.updateVisibleSection()
    this.setupCardBrandDetection()
  }

  setupCardElements() {
    // Create card elements
    this.cardNumber = this.elements.create('cardNumber')
    this.cardExpiry = this.elements.create('cardExpiry')
    this.cardCvc = this.elements.create('cardCvc')

    // Mount card elements
    this.cardNumber.mount(this.cardNumberTarget)
    this.cardExpiry.mount(this.cardExpiryTarget)
    this.cardCvc.mount(this.cardCvcTarget)
  }

  togglePaymentMethod(event) {
    const method = event.currentTarget.dataset.method
    this.paymentMethodValue = method
    this.updateVisibleSection()
  }

  updateVisibleSection() {
    if (this.paymentMethodValue === 'card') {
      this.cardSectionTarget.classList.remove('hidden')
      this.achSectionTarget.classList.add('hidden')
    } else {
      this.cardSectionTarget.classList.add('hidden')
      this.achSectionTarget.classList.remove('hidden')
    }
  }

  setupCardBrandDetection() {
    this.cardNumber.on('change', (event) => {
      if (event.brand) {
        this.updateCardBrand(event.brand)
      } else {
        this.hideCardBrand()
      }
    })
  }

  updateCardBrand(brand) {
    const brandIcons = {
      visa: `<svg width="35" height="24" viewBox="0 0 35 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="34.5" height="24" rx="2.5" fill="white"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M10.5377 16.2582H8.44769L6.88042 10.1924C6.80604 9.91334 6.64809 9.66666 6.41575 9.5504C5.83592 9.25823 5.19699 9.0257 4.49997 8.90843V8.67489H7.86685C8.33152 8.67489 8.68003 9.0257 8.73812 9.43313L9.5513 13.8086L11.6403 8.67489H13.6723L10.5377 16.2582ZM14.834 16.2582H12.8601L14.4854 8.67489H16.4593L14.834 16.2582ZM19.013 10.7757C19.0711 10.3673 19.4196 10.1337 19.8262 10.1337C20.4651 10.0751 21.1611 10.1924 21.742 10.4835L22.0905 8.85081C21.5096 8.61727 20.8707 8.5 20.2909 8.5C18.3751 8.5 16.9811 9.55041 16.9811 11.0082C16.9811 12.1173 17.9685 12.6996 18.6655 13.0504C19.4196 13.4002 19.71 13.6338 19.6519 13.9835C19.6519 14.5082 19.0711 14.7418 18.4913 14.7418C17.7942 14.7418 17.0972 14.5669 16.4593 14.2747L16.1108 15.9085C16.8078 16.1996 17.5619 16.3169 18.2589 16.3169C20.407 16.3745 21.742 15.3251 21.742 13.75C21.742 11.7665 19.013 11.6502 19.013 10.7757V10.7757ZM28.65 16.2582L27.0827 8.67489H25.3993C25.0508 8.67489 24.7023 8.90843 24.5861 9.25823L21.6839 16.2582H23.7158L24.1214 15.1502H26.618L26.8504 16.2582H28.65ZM25.6897 10.7171L26.2695 13.5751H24.6441L25.6897 10.7171Z" fill="#172B85"/>
            </svg>`,
      mastercard: `<svg width="35" height="24" viewBox="0 0 35 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="34.5" height="24" rx="2.5" fill="white"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M17.5714 17.5462C16.255 18.6506 14.5475 19.3174 12.6815 19.3174C8.51807 19.3174 5.14291 15.9979 5.14291 11.9031C5.14291 7.80826 8.51807 4.48877 12.6815 4.48877C14.5475 4.48877 16.2551 5.15551 17.5715 6.25997C18.8879 5.15552 20.5955 4.48879 22.4614 4.48879C26.6249 4.48879 30 7.80829 30 11.9031C30 15.9979 26.6249 19.3174 22.4614 19.3174C20.5954 19.3174 18.8878 18.6506 17.5714 17.5462Z" fill="#ED0006"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M17.5714 17.5462C19.1923 16.1863 20.2202 14.1627 20.2202 11.9031C20.2202 9.64341 19.1923 7.61986 17.5714 6.25994C18.8878 5.1555 20.5954 4.48877 22.4614 4.48877C26.6248 4.48877 30 7.80826 30 11.9031C30 15.9979 26.6248 19.3174 22.4614 19.3174C20.5954 19.3174 18.8878 18.6506 17.5714 17.5462Z" fill="#F9A000"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M17.5715 17.5462C19.1924 16.1863 20.2201 14.1627 20.2201 11.9031C20.2201 9.64347 19.1924 7.61993 17.5715 6.26001C15.9506 7.61993 14.9228 9.64346 14.9228 11.9031C14.9228 14.1627 15.9506 16.1863 17.5715 17.5462Z" fill="#FF5E00"/>
                </svg>`,
      amex: `<svg width="35" height="24" viewBox="0 0 35 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="34.5" height="24" rx="2.5" fill="#1F72CD"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.21646 8.43066L3 15.8641H6.85055L7.3279 14.6789H8.41903L8.89639 15.8641H13.1348V14.9595L13.5124 15.8641H15.7048L16.0825 14.9404V15.8641H24.8972L25.969 14.7097L26.9726 15.8641L31.5 15.8737L28.2734 12.1681L31.5 8.43066H27.0428L25.9995 9.56375L25.0275 8.43066H15.4383L14.6148 10.3493L13.7721 8.43066H9.92958V9.30447L9.50213 8.43066H6.21646ZM19.3794 9.48622H24.4412L25.9893 11.2327L27.5874 9.48622H29.1356L26.7833 12.1671L29.1356 14.8171H27.5172L25.969 13.0503L24.3628 14.8171H19.3794V9.48622ZM20.6294 11.5643V10.5906V10.5897H23.7878L25.166 12.1469L23.7267 13.7127H20.6294V12.6496H23.3908V11.5643H20.6294ZM6.96147 9.48622H8.83841L10.9719 14.5269V9.48622H13.028L14.6759 13.1004L16.1946 9.48622H18.2404V14.8202H16.9955L16.9854 10.6405L15.1705 14.8202H14.0569L12.2319 10.6405V14.8202H9.67099L9.18549 13.6244H6.56249L6.07799 14.8192H4.70587L6.96147 9.48622ZM7.01038 12.5189L7.87455 10.3887L8.73772 12.5189H7.01038Z" fill="white"/>
            </svg>`,
      discover: `<svg width="35" height="24" viewBox="0 0 35 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="34.5" height="24" rx="2.5" fill="white"/>
                <path d="M14.025 22.55L33.025 16.8V21C33.025 21.8561 32.331 22.55 31.475 22.55H14.025Z" fill="#FD6020"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M29.3937 9.11084C30.439 9.11084 31.0139 9.59438 31.0139 10.5077C31.0661 11.2062 30.5957 11.7972 29.9686 11.9046L31.3797 13.8925H30.2822L29.0801 11.9584H28.9755V13.8925H28.087V9.11084H29.3937ZM28.9755 11.3137H29.2369C29.8118 11.3137 30.0731 11.045 30.0731 10.5615C30.0731 10.1317 29.8118 9.86304 29.2369 9.86304H28.9755V11.3137ZM25.0034 13.8925H27.5121V13.0866H25.8919V11.7972H27.4599V10.9913H25.8919V9.91674H27.5121V9.11084H25.0034V13.8925V13.8925ZM22.3902 12.3345L21.1881 9.11084H20.2473L22.1811 14H22.6515L24.5853 9.11084H23.6445L22.3902 12.3345V12.3345ZM11.7805 11.5286C11.7805 12.8717 12.8258 14 14.1324 14C14.5505 14 14.9163 13.8925 15.2822 13.7314V12.6568C15.0209 12.9792 14.655 13.1941 14.2369 13.1941C13.4007 13.1941 12.7212 12.5494 12.7212 11.6897V11.5823C12.669 10.7227 13.3484 9.97048 14.1846 9.91675C14.6028 9.91675 15.0209 10.1317 15.2822 10.454V9.37948C14.9686 9.16458 14.5505 9.11085 14.1846 9.11085C12.8258 9.0034 11.7805 10.1317 11.7805 11.5286V11.5286ZM10.1602 10.9376C9.6376 10.7227 9.4808 10.6152 9.4808 10.3466C9.53307 10.0242 9.79439 9.75557 10.108 9.8093C10.3693 9.8093 10.6306 9.97048 10.8397 10.1854L11.3101 9.54066C10.9442 9.2183 10.4738 9.00339 10.0035 9.00339C9.27175 8.94967 8.64457 9.54066 8.5923 10.2928V10.3466C8.5923 10.9913 8.85363 11.3674 9.68986 11.636C9.89892 11.6897 10.108 11.7972 10.317 11.9046C10.4738 12.0121 10.5784 12.1733 10.5784 12.3882C10.5784 12.7643 10.2648 13.0866 9.95119 13.0866H9.89892C9.4808 13.0866 9.11495 12.818 8.95816 12.4419L8.38325 13.0329C8.69683 13.6239 9.32401 13.9463 9.95119 13.9463C10.7874 14 11.4669 13.3553 11.5191 12.4956V12.3345C11.4669 11.6897 11.2055 11.3674 10.1602 10.9376V10.9376ZM7.12889 13.8925H8.01739V9.11084H7.12889V13.8925V13.8925ZM2.99997 9.11086H4.30659H4.56791C5.82226 9.16459 6.81529 10.2391 6.76303 11.5286C6.76303 12.227 6.44944 12.8718 5.92679 13.3553C5.45641 13.7314 4.8815 13.9463 4.30659 13.8926H2.99997V9.11086ZM4.1498 13.0866C4.56792 13.1404 5.0383 12.9792 5.35189 12.7106C5.66548 12.3882 5.82227 11.9584 5.82227 11.4748C5.82227 11.045 5.66548 10.6152 5.35189 10.2928C5.0383 10.0242 4.56792 9.86302 4.1498 9.91675H3.88848V13.0866H4.1498Z" fill="black"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M17.9477 9C16.6411 9 15.5435 10.0745 15.5435 11.4714C15.5435 12.8146 16.5888 13.9429 17.9477 13.9966C19.3066 14.0503 20.3519 12.9221 20.4041 11.5252C20.3519 10.1283 19.3066 9 17.9477 9V9Z" fill="#FD6020"/>
              </svg>`,
    }

    const brandIcon = brandIcons[brand]
    if (brandIcon) {
      this.cardBrandTarget.innerHTML = brandIcon
      this.cardBrandTarget.classList.remove('opacity-0')
      this.cardBrandTarget.classList.add('opacity-100')
    }
  }

  hideCardBrand() {
    this.cardBrandTarget.classList.remove('opacity-100')
    this.cardBrandTarget.classList.add('opacity-0')
  }

  async submitForm(event) {
    event.preventDefault()

    if (this.paymentMethodValue === 'card') {
      await this.handleCardPayment()
    } else {
      await this.handleAchPayment()
    }
  }

  async handleCardPayment() {
    const { paymentMethod, error } = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.cardNumber,
      billing_details: {
        name: this.cardholderNameTarget.value,
      }
    })

    if (error) {
      console.error(error)
    } else {
      console.log('Card PaymentMethod:', paymentMethod)
      this.paymentMethodIdTarget.value = paymentMethod.id // Set the hidden field value
      this.formTarget.submit() // 
    }
  }

  async handleAchPayment() {
    const { paymentMethod, error } = await this.stripe.createPaymentMethod({
      type: 'us_bank_account',
      us_bank_account: {
        account_holder_type: 'individual',
        account_type: this.accountTypeTarget.value,
        routing_number: this.routingNumberTarget.value,
        account_number: this.accountNumberTarget.value,
      },
      billing_details: {
        name: this.accountNameTarget.value,
      }
    })

    if (error) {
      console.error(error)
    } else {
      console.log('ACH PaymentMethod:', paymentMethod)
      this.paymentMethodIdTarget.value = paymentMethod.id // Set the hidden field value
      this.formTarget.submit() // 
    }
  }

  disconnect() {
    // Clean up Stripe elements
    this.cardNumber?.unmount()
    this.cardExpiry?.unmount()
    this.cardCvc?.unmount()
  }
};
