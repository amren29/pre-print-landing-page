import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["fieldInput", "hexOutput", "decimalOutput", "binaryOutput", "resultsContainer", "fieldBreakdown", "fieldBreakdownContainer"]
  static values = {
    format: Object
  }

  connect() {
    this.generate()
  }

  generate() {
    const format = this.formatValue
    const fieldValues = this.collectFieldValues()
    
    const bits = this.generateBits(format, fieldValues)

    const hex = this.binaryToHex(bits)
    const decimal = this.binaryToDecimal(bits)
    
    this.hexOutputTarget.textContent = hex
    this.decimalOutputTarget.textContent = decimal
    this.binaryOutputTarget.textContent = bits
    
    this.updateFieldBreakdown(format, bits)
  }

  collectFieldValues() {
    const values = {}
    this.fieldInputTargets.forEach(input => {
      const fieldKey = input.dataset.fieldKey
      const max = parseInt(input.max)
      let val = parseInt(input.value) || 0
      if (!isNaN(max) && val > max) {
        val = max
        input.value = max
      }
      values[fieldKey] = val
    })
    return values
  }

  generateBits(format, fieldValues) {
    const bitLength = format.length
    const bits = new Array(bitLength).fill('0')
    
    const dataFields = this.getDataFields(format)
    dataFields.forEach(fieldKey => {
      const fieldConfig = format[fieldKey]
      const value = fieldValues[fieldKey] || 0
      this.setFieldBits(bits, fieldConfig, value)
    })
    
    if (format.parity_bits) {
      format.parity_bits.forEach(parityConfig => {
        const parityValue = this.calculateParityBit(bits.join(''), parityConfig)
        bits[parityConfig.position - 1] = parityValue.toString()
      })
    }
    
    return bits.join('')
  }

  getDataFields(format) {
    const fieldKeys = [
      'facility_code', 'site_code', 'card_number', 'access_code',
      'issue_code', 'issue_level', 'one', 'oem', 'agency_code',
      'system_code', 'credential_code', 'credential_series',
      'individual_series_issue', 'transaction_status_messages',
      'expiration_date', 'company_id_code'
    ]
    return fieldKeys.filter(key => format[key] !== undefined)
  }

  setFieldBits(bits, fieldConfig, value) {
    if (fieldConfig.bits) {
      const binaryStr = value.toString(2).padStart(fieldConfig.bits.length, '0')
      const truncatedBinary = binaryStr.slice(-fieldConfig.bits.length)
      fieldConfig.bits.forEach((bitPos, idx) => {
        bits[bitPos] = truncatedBinary[idx] || '0'
      })
    } else {
      const startPos = fieldConfig.start
      const length = fieldConfig.length
      const binaryStr = value.toString(2).padStart(length, '0')
      const truncatedBinary = binaryStr.slice(-length)
      
      for (let i = 0; i < length; i++) {
        bits[startPos + i] = truncatedBinary[i] || '0'
      }
    }
  }

  calculateParityBit(bitsString, parityConfig) {
    const bitsToCheck = this.extractParityBits(bitsString, parityConfig)
    const countOnes = (bitsToCheck.match(/1/g) || []).length
    
    if (parityConfig.type === 'even') {
      return countOnes % 2 === 1 ? 1 : 0
    } else {
      return countOnes % 2 === 0 ? 1 : 0
    }
  }

  extractParityBits(bitsString, parityConfig) {
    if (parityConfig.range) {
      const startIdx = parityConfig.range[0]
      const endIdx = parityConfig.range[1] + 1
      return bitsString.slice(startIdx, endIdx)
    } else if (parityConfig.bits) {
      return parityConfig.bits.map(pos => bitsString[pos - 1]).join('')
    }
    return ''
  }

  binaryToHex(binaryString) {
    const paddedLength = Math.ceil(binaryString.length / 4) * 4
    const padded = binaryString.padStart(paddedLength, '0')
    return BigInt('0b' + padded).toString(16).toUpperCase()
  }

  binaryToDecimal(binaryString) {
    return BigInt('0b' + binaryString).toString()
  }

  updateFieldBreakdown(format, bitsString) {
    const dataFields = this.getDataFields(format)
    
    if (dataFields.length === 0) {
      this.fieldBreakdownContainerTarget.style.display = 'none'
      return
    }
    
    this.fieldBreakdownContainerTarget.style.display = 'block'
    
    const tbody = this.fieldBreakdownTarget
    tbody.innerHTML = ''
    
    const fieldLabels = {
      facility_code: 'Facility Code',
      site_code: 'Site Code',
      card_number: 'Card Number',
      access_code: 'Access Code',
      issue_code: 'Issue Code',
      issue_level: 'Issue Level',
      one: 'One',
      oem: 'OEM',
      agency_code: 'Agency Code',
      system_code: 'System Code',
      credential_code: 'Credential Code',
      credential_series: 'Credential Series',
      individual_series_issue: 'Individual Series Issue',
      transaction_status_messages: 'Transaction Status Messages',
      expiration_date: 'Expiration Date',
      company_id_code: 'Company ID Code'
    }
    
    dataFields.forEach(fieldKey => {
      const fieldConfig = format[fieldKey]
      const extracted = this.extractFieldValue(bitsString, fieldConfig)
      
      const row = document.createElement('tr')
      row.className = 'border-t border-slate-200'
      row.innerHTML = `
        <td class="text-slate-800 py-2">${fieldLabels[fieldKey] || fieldKey}</td>
        <td class="font-source text-slate-700 py-2">${extracted.hex}</td>
        <td class="font-source text-slate-700 py-2">${extracted.decimal}</td>
        <td class="font-source text-slate-700 py-2">${extracted.bits}</td>
      `
      tbody.appendChild(row)
    })
  }

  extractFieldValue(bitsString, fieldConfig) {
    let extractedBits
    
    if (fieldConfig.bits) {
      extractedBits = fieldConfig.bits.map(pos => bitsString[pos]).join('')
    } else {
      const startPos = fieldConfig.start
      const length = fieldConfig.length
      extractedBits = bitsString.slice(startPos, startPos + length)
    }
    
    const decimal = parseInt(extractedBits, 2) || 0
    const hex = decimal.toString(16).toUpperCase()
    
    return {
      bits: extractedBits,
      decimal: decimal.toString(),
      hex: hex
    }
  }

  copyValue(event) {
    const targetName = event.currentTarget.dataset.copyTarget
    const targetElement = this.targets.find(targetName)
    const textToCopy = targetElement.textContent
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      const svg = event.currentTarget.querySelector('svg')
      const originalPath = svg.innerHTML
      svg.innerHTML = '<path d="M7.75 12.75L10 15.25L16.25 8.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
      svg.classList.add('text-green-500')
      
      setTimeout(() => {
        svg.innerHTML = originalPath
        svg.classList.remove('text-green-500')
      }, 1500)
    }).catch(err => {
      console.error('Failed to copy text: ', err)
    })
  }
};
