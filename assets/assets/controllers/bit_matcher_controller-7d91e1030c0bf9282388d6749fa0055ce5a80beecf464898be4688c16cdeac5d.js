import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["bitInput", "resultsContainer"]
  static values = {
    currentBits: String,
    currentFormat: Object
  }

  connect() {
    const params = new URLSearchParams(window.location.search)
    const bits = params.get('bits')
    if (bits) {
      this.bitInputTarget.value = bits
      this.generateMatchList()
    }
  }

  updateUrlParam(input) {
    const url = new URL(window.location)
    if (input && input.trim().length > 0) {
      url.searchParams.set('bits', input.trim())
    } else {
      url.searchParams.delete('bits')
    }
    history.replaceState(null, '', url)
  }

  isHexadecimal(input) {
    // Remove any whitespace
    const cleaned = input.replace(/\s/g, '');
    
    // If it's all 0s and 1s, it's binary
    if (/^[01]+$/.test(cleaned)) {
      return false;
    }
    
    // If it contains non-hex characters, it's invalid
    if (!/^[0-9A-Fa-f]+$/.test(cleaned)) {
      return false;
    }
    
    // If we get here, it's hex (contains valid hex chars but not just binary)
    return true;
  }

  hexToBinary(hex) {
    const decimal = parseInt(hex, 16);
    const binary = decimal.toString(2);
    return binary;
  }

  generateMatchList() {
    let input = this.bitInputTarget.value;
    this.updateUrlParam(input);
    let bits;

    // Check if input is hexadecimal
    if (this.isHexadecimal(input)) {
      bits = this.hexToBinary(input);
    } else {
      // Assume binary input, just clean it
      bits = input.replace(/\s/g, '');
    }

    this.currentBitsValue = bits;
    let lengthMatches = this.formats().filter((format) => this.matchesLength(bits, format));
    console.log('lengthMatches', lengthMatches)
    let parityMatches = lengthMatches.filter((format) => this.parityIsValid(bits, format));
    console.log('parityMatches', parityMatches)

    this.showMatches(parityMatches);
  }

  matchesLength(bits, format) {
    // calculate if parity is valid for the bits and format provided
    const cleanedBits = String(bits).replace(/\s/g, '');
    
    // Check if the length of the cleaned bits matches the format's specified length
    return cleanedBits.length === format.length;
  }

  // calculate if parity is valid for the bits and format provided
  parityIsValid(bits, format) {
    // If no parity bits are defined, return true
    if (!format.parityBits || format.parityBits.length === 0) {
      return true;
    }

    // Remove any whitespace
    const cleanedBits = String(bits).replace(/\s/g, '');

    // Check each parity configuration
    return format.parityBits.every(parityConfig => {
      console.log('parityConfig', parityConfig)
      // Determine the bits to check for parity
      let bitsToCheck, parityBit;
      
      if (parityConfig.range) {
        // Slice using range
        parityBit = cleanedBits[parityConfig.position - 1];
        console.log('[range] parityBit', parityBit)
        bitsToCheck = cleanedBits.slice(parityConfig.range[0], parityConfig.range[1] + 1);
        console.log('[range] bitsToCheck', bitsToCheck)
      } else if (parityConfig.bits) {
        // Extract specific bits if range is not provided
        parityBit = cleanedBits[parityConfig.position - 1];
        console.log('[bits] cleanedBits', cleanedBits)
        console.log('[bits] parityConfig.position', parityConfig.position)
        console.log('[bits] parityBit', parityBit)
        bitsToCheck = parityConfig.bits.map(pos => cleanedBits[pos - 1]).join('');
        console.log('[bits] bitsToCheck', bitsToCheck)
      } else {
        console.log('wttfff')
        // If no specific checking method, assume valid
        return true;
      }

      let count1s = bitsToCheck.split('').filter(bit => bit === '1').length;

      // Parity check
      if (parityConfig.type === 'even') {
        // If parity bit is 1, increment count to make it even
        if (parityBit === '1') {
          count1s += 1;
        }
        return count1s % 2 === 0;
      } else if (parityConfig.type === 'odd') {
        // If parity bit is 1, decrement count to make it odd
        if (parityBit === '1') {
          count1s -= 1;
        }
        return count1s % 2 === 1;
      }

      // If no parity type specified, assume valid
      return true;
    });
  }

  parseBits(bits, format) {
    // Convert input to string and remove any potential whitespace
    const cleanedBits = String(bits).replace(/\s/g, '');
    
    // Initialize the result object
    const result = {
      format: format.name,
      rawBits: cleanedBits
    };

    // Helper function to extract bits from a specific section
    const extractSection = (section) => {
      if (section.start !== undefined && section.length !== undefined) {
        return cleanedBits.slice(section.start, section.start + section.length);
      } else if (section.bits) {
        // If specific bit positions are provided
        return section.bits.map(pos => {
          return cleanedBits[pos]
        }).join('');
      }
      return null;
    };

    // Parse out different sections based on format
    const sectionsToParse = [
      'facilityCode', 
      'siteCode', 
      'cardNumber', 
      'accessCode', 
      'issueCode', 
      'issueLevel', 
      'one',
      'oem',
      'agencyCode',
      'systemCode',
      'credentialCode',
      'credentialSeries',
      'individualSeriesIssue',
      'transactionStatusMessages',
      'expirationDate',
      'companyIdCode'
    ];

    sectionsToParse.forEach(sectionName => {
      if (format[sectionName]) {
        const extractedBits = extractSection(format[sectionName]);
        console.log('extractedBits', extractedBits)
        if (extractedBits) {
          result[sectionName] = {
            bits: extractedBits,
            decimal: parseInt(extractedBits, 2),
            hex: parseInt(extractedBits, 2).toString(16).toUpperCase()
          };
        }
      }
    });

    return result;
  }

  generateDetailsTable(format) {
    const parsedResult = this.parseBits(this.currentBitsValue, format);

    // Sections to display (in order)
    const sectionsToDisplay = [
      { key: 'facilityCode', label: 'Facility code' },
      { key: 'siteCode', label: 'Site code' },
      { key: 'cardNumber', label: 'Card number' },
      { key: 'accessCode', label: 'Access code' },
      { key: 'issueCode', label: 'Issue code' },
      { key: 'issueLevel', label: 'Issue level' },
      { key: 'one', label: 'One' },
      { key: 'oem', label: 'OEM' },
      { key: 'agencyCode', label: 'Agency code' },
      { key: 'systemCode', label: 'System code' },
      { key: 'credentialCode', label: 'Credential code' },
      { key: 'credentialSeries', label: 'Credential series' },
      { key: 'individualSeriesIssue', label: 'Individual series issue' },
      { key: 'transactionStatusMessages', label: 'Transaction status messages' },
      { key: 'expirationDate', label: 'Expiration date'},
      { key: 'companyIdCode', label: 'Company ID code'}
    ];

    const rows = sectionsToDisplay
      .filter(section => !!parsedResult[section.key])
      .map(section => `
        <tr class="border-t border-ag-gray-100">
          <td class="min-h-[42px] pr-2 py-0.5 pl-4 text-ag-gray-600 text-xs/5 font-medium -tracking-[0.018px]">
            ${section.label}
          </td>

          ${[
            parsedResult[section.key].hex,
            parsedResult[section.key].decimal,
            parsedResult[section.key].bits
          ].map((value, index) => `
            <td class="font-mono font-medium text-[13px]/5 -tracking-[0.02px]">
              <div class="min-h-[42px] flex items-center justify-start">
                <button 
                  class="group/cell relative py-0.5 pr-4 md:pr-8 [word-break:break-word] text-start"
                  data-controller="website-copy"
                  data-website-copy-target="trigger"
                  data-website-copy-value-value="${value}"
                  data-action="click->website-copy#copy"
                >
                  ${value}

                  <svg class="hidden md:block opacity-0 group-hover/cell:opacity-100 absolute top-1/2 -translate-y-1/2 right-2 transition-opacity duration-150 ease-out" width="16" height="16" fill="none">
                    <path class="stroke-ag-gray-400" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.75 5.75v-2a1 1 0 0 1 1-1h5.5a1 1 0 0 1 1 1v5.5a1 1 0 0 1-1 1h-2m-4.5-4.5h-2a1 1 0 0 0-1 1v5.5a1 1 0 0 0 1 1h5.5a1 1 0 0 0 1-1v-2m-4.5-4.5h3.5a1 1 0 0 1 1 1v3.5"/>
                  </svg>

                  <div class="pointer-events-none w-max absolute bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-lg bg-ag-gray-950 shadow-[0_24px_40px_-20px_rgba(38,38,43,0.30),0_6px_16px_0_rgba(38,38,43,0.04),0_1px_1px_0_rgba(38,38,43,0.16),0_0_0_1px_#26262B,0_4px_12px_-6px_rgba(38,38,43,0.36);] text-white text-xs/5 font-medium -tracking-[0.018px] opacity-0 group-data-[copied]/cell:opacity-100 scale-90 group-data-[copied]/cell:scale-100 transition-[opacity,transform] duration-150 ease-out">
                    Copied
                  </div>
                </button>
              </div>
            </td>
          `).join("")}
        </tr>
      `)
    
    return rows.join("")
  }

  showMatches(matches) {
    // Clear any existing matches
    this.resultsContainerTarget.innerHTML = '';

    if (matches.length === 0) return;

    // Create a list to show matches
    const matchList = document.createElement('ul');
    matchList.className = 'overflow-hidden w-full mt-2 rounded-2xl bg-white shadow-[0_24px_40px_-20px_rgba(38,38,43,0.30),0_10px_24px_0_rgba(38,38,43,0.06),0_1px_1px_0_rgba(38,38,43,0.16),0_0_0_1px_rgba(38,38,43,0.05),0_8px_14px_-10px_rgba(38,38,43,0.40)] md:mt-4';

    // Populate the list with matches
    matches.forEach(format => {
      const listItem = document.createElement('li');
      listItem.dataset.controller="accordion";
      listItem.classList.add("group");

      listItem.innerHTML = `
        <button 
          class="group/trigger w-full px-4 py-3 flex items-center justify-between border-t border-ag-gray-100 group-first:border-t-0"
          data-action="click->accordion#toggle"
        >
          <h3 class="text-[13px]/6 font-medium -tracking-[0.13px]">
            ${format.name}
          </h3>

          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" 
            class="text-ag-gray-400 group-hover/trigger:text-ag-gray-600 data-[open]:rotate-180 transition-[color,transform] duration-300 ease-out"
            data-accordion-target="chevron"
          >
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 7L8 10L11 7" />
          </svg>
        </button>

        <div 
          class="bg-ag-gray-50 h-[var(--accordion-content-height,0)] overflow-hidden transition-[height] duration-[400ms] ease-in-out-quad"
          data-accordion-target="content"
        >
          <table class="table-auto w-full">
            <thead>
              <tr class="border-t border-ag-gray-100">
                <th></th>
                ${["Hexadecimal", "Decimal", "Binary"].map(title => `
                  <th class="text-start pr-2 py-1.5 text-ag-gray-600 text-xs/5 font-medium -tracking-[0.018px]">
                    ${title}
                  </th>  
                `).join("")}
              </tr>
            </thead>
            <tbody>
              ${this.generateDetailsTable(format)}
            </tbody>
          </table>
        </div>
      `;

      matchList.appendChild(listItem);
    });

    // Add the list to the results container
    this.resultsContainerTarget.appendChild(matchList);
  }

  formats() {
    return [
      {
        name: "(12) Casi F/2F 12 Digit Magstripe",
        length: 12,
        parityBits: [], // F/2F encoding doesn't use parity bits
        cardNumber: { start: 0, length: 12 }
      },
      {
        name: "(13) Midas",
        length: 13,
        parityBits: [],
        siteCode: { start: 1, length: 6 },
        cardNumber: { start: 7, length: 4 }  // Note there appears to be a 3-bit gap between site code and card number
      },
      {
        name: "(15) Tecom swipe",
        length: 15,
        parityBits: [],
        siteCode: { start: 1, length: 6 },
        cardNumber: { start: 7, length: 6 }
      },
      {
        name: "(26) Standard 26bit - (H10301)",
        length: 26,
        parityBits: [
          { position: 1, type: 'even', range: [1, 12] },
          { position: 26, type: 'odd', range: [13, 24] }
        ],
        facilityCode: { start: 1, length: 8 },
        cardNumber: { start: 9, length: 16 }
      },
      {
        name: "(26) Indala 26bit",
        length: 26,
        parityBits: [
          { position: 1, type: 'even', range: [1, 12] },
          { position: 26, type: 'odd', range: [13, 24] }
        ],
        siteCode: { start: 1, length: 12 },
        cardNumber: { start: 13, length: 12 }
      },
      {
        name: "(27) Indala 27bit",
        length: 27,
        parityBits: [],
        siteCode: { start: 0, length: 13 },
        cardNumber: { start: 13, length: 14 }
      },
      {
        name: "(27) Indala ASC 27bit",
        length: 27,
        parityBits: [],
        siteCode: { bits: [9, 4, 6, 5, 0, 7, 19, 8, 10, 16, 24, 12, 22] },
        cardNumber: { bits: [26, 1, 3, 15, 14, 17, 20, 13, 25, 2, 18, 21, 11, 23] }
      },
      {
        name: "(27) Tecom",
        length: 27,
        parityBits: [],
        siteCode: { bits: [15, 19, 24, 23, 22, 18, 6, 10, 14, 3, 2] },
        cardNumber: { bits: [0, 1, 13, 12, 9, 26, 20, 16, 17, 21, 25, 7, 8, 11, 4, 5] }
      },
      {
        name: "(28) 2804 Wiegand",
        length: 28,
        parityBits: [
         { position: 1, type: 'even', range: [1, 13] },  // Even Parity
         { position: 3, type: 'odd', bits: [5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27] },  // Odd Parity
         { position: 28, type: 'odd', range: [0, 26] }  // Odd Parity 2
        ],
        facilityCode: { start: 5, length: 8 },
        cardNumber: { start: 12, length: 15 }
      },
      {
        name: "(29) Indala 29bit",
        length: 29,
        parityBits: [],
        siteCode: { start: 0, length: 13 },
        cardNumber: { start: 13, length: 16 }
      },
      {
        name: "(30) ATS Wiegand 30bit",
        length: 30,
        parityBits: [
          { position: 1, type: 'even', range: [1, 11] },
          { position: 30, type: 'odd', range: [13, 28] }],
        siteCode: { start: 1, length: 12 },
        cardNumber: { start: 13, length: 16 }
      },
      // QA from here down
      {
        name: "(31) HID ADT 31bit",
        length: 31,
        parityBits: [],
        siteCode: { start: 1, length: 4 },
        cardNumber: { start: 5, length: 23 }
      },
      {
        name: "(32) ATS Wiegand 32bit",
        length: 32,
        parityBits: [
          { position: 1, type: 'even', range: [1, 13] },
          { position: 32, type: 'odd', range: [14, 30] }
        ],
        siteCode: { start: 2, length: 13 },
        cardNumber: { start: 15, length: 17 }
      },
      {
        name: "(32) Indala/Kantech KSF",
        length: 32,
        parityBits: [],
        siteCode: { start: 7, length: 8 },
        cardNumber: { start: 15, length: 16 }
      },
      {
        name: "(32) K32",
        length: 32,
        parityBits: [
          { position: 1, type: 'even', range: [1, 13] },
          { position: 32, type: 'odd', range: [14, 30] }
        ],
        siteCode: { start: 7, length: 8 },
        cardNumber: { start: 15, length: 16 },
      },
      {
        name: "(32) Wiegand 32bit",
        length: 32,
        parityBits: [],
        siteCode: { start: 4, length: 12 },
        cardNumber: { start: 16, length: 16 }
      },
      {
        name: "(32) HID 32bit Hewlett-Packard",
        length: 32,
        parityBits: [],
        siteCode: { start: 1, length: 12 },
        cardNumber: { start: 13, length: 19 }
      },
      {
        name: "(32) HID Check Point 32bit",
        length: 32,
        parityBits: [],
        cardNumber: { start: 1, length: 24 }  // Only card number field, no site code
      },
      {
        name: "(32) 4byte CSN 32bit",
        length: 32,
        parityBits: [],
        cardNumber: { start: 0, length: 32 }  // NOTE: This has a CSN field instead of site/card number fields
      },
      {
        name: "(32) 32-B",
        length: 32,
        parityBits: [
          { position: 1, type: 'even', range: [1, 17] },
          { position: 36, type: 'odd', range: [18, 35] }
        ],
        siteCode: { start: 1, length: 18 },
        cardNumber: { start: 19, length: 16 }
      },
      {
        name: "(32) Kastle",
        length: 32,
        parityBits: [
          { position: 1, type: 'even', range: [1, 16] },
          { position: 32, type: 'odd', range: [14, 30] }
        ],
        siteCode: { start: 7, length: 8 },
        cardNumber: { start: 15, length: 16 },
        issueLevel: { start: 2, length: 5 }, // NOTE: Has additional issueLevel field
        one: { start: 1, length: 1 }  // NOTE: Has additional 'one' field
      },
      {
        name: "(33) Indala 33bit (DSX)",
        length: 33,
        parityBits: [],
        siteCode: { start: 1, length: 7 },
        cardNumber: { start: 8, length: 24 }
      },
      {
        name: "(33) HID 33bit - (D10202)",
        length: 33,
        parityBits: [
          { position: 1, type: 'even', range: [1, 16] },
          { position: 33, type: 'odd', range: [17, 32] }
        ],
        siteCode: { start: 1, length: 7 },
        cardNumber: { start: 8, length: 24 }
      },
      {
        name: "(33) RS2-HID F/C 3 33bit - (R901592C)",
        length: 33,
        parityBits: [
          { position: 2, type: 'even', range: [1, 29] },
          { position: 33, type: 'odd', range: [1, 29] }
        ],
        siteCode: { start: 2, length: 2 },
        cardNumber: { start: 4, length: 27 }
      },
      {
        name: "(34) HID Standard 34bit - (H10306)",
        length: 34,
        parityBits: [
          { position: 1, type: 'even', range: [1, 16] },
          { position: 34, type: 'odd', range: [17, 33] }
        ],
        siteCode: { start: 1, length: 16 },
        cardNumber: { start: 17, length: 16 }
      },
      {
        name: "(34) Indala 34bit Optus",
        length: 34,
        parityBits: [],
        siteCode: { start: 22, length: 11 },
        cardNumber: { start: 1, length: 16 }
      },
      {
        name: "(34) Cardkey Smartpass",
        length: 34,
        parityBits: [],
        siteCode: { start: 1, length: 14 },
        cardNumber: { start: 19, length: 16 }
      },
      {
        name: "(34) HID 34bit - (N1002)",
        length: 34,
        parityBits: [],
        siteCode: { start: 9, length: 8 },
        cardNumber: { start: 17, length: 16 }
      },
      {
        name: "(34) BQT 34bit",
        length: 34,
        parityBits: [
          { position: 1, type: 'even', range: [1, 16] },
          { position: 34, type: 'odd', range: [17, 33] }
        ],
        siteCode: { start: 1, length: 8 },
        cardNumber: { start: 9, length: 24 }
      },
      {
        name: "(35) HID 35bit Corporate 1000",
        length: 35,
        parityBits: [
          { position: 2, type: 'even', bits: [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34] },
          { position: 35, type: 'odd', bits: [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33] },
          { position: 1, type: 'odd', range: [0, 33] }  // Odd Parity 2
        ],
        siteCode: { start: 2, length: 12 },
        cardNumber: { start: 14, length: 20 }
      },
      {
        name: "(36) HID 36bit Siemens",
        length: 36,
        parityBits: [
          { position: 1, type: 'odd', bits: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35] },
          { position: 36, type: 'even', bits: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34] }
        ],
        siteCode: { start: 1, length: 18 },
        cardNumber: { start: 19, length: 16 }
      },
      {
        name: "(36) Chubb 36bit",
        length: 36,
        parityBits: [],
        siteCode: { start: 1, length: 14 },
        cardNumber: { start: 19, length: 16 }
      },
      {
        name: "(36) HID 36bit Inner Range",
        length: 36,
        parityBits: [],
        siteCode: { start: 21, length: 12 },
        cardNumber: { start: 1, length: 16 }
      },
      {
        name: "(36) HID Simplex 36bit",
        length: 36,
        parityBits: [
          { position: 1, type: 'odd', range: [1, 17] },
          { position: 36, type: 'odd', range: [17, 35] }
        ],
        siteCode: { start: 1, length: 8 },
        cardNumber: { start: 11, length: 24 }
      },
      {
        name: "(36) Keyscan C15001",
        length: 36,
        parityBits: [
          { position: 1, type: 'even', range: [1, 18] },
          { position: 36, type: 'odd', range: [19, 35] }
        ],
        oem: { start: 1, length: 10 },
        siteCode: { start: 11, length: 8 },
        cardNumber: { start: 19, length: 16 }
      },
      {
        name: "(36) HID Clock & Data - (H10320)",
        length: 36,
        parityBits: [
          { position: 33, type: 'even', bits: [2,5,8,11,14,17,20,23,26,29,32] },
          { position: 34, type: 'odd', bits: [1,4,7,10,13,16,19,22,25,28,31] },
          { position: 36, type: 'even', bits: [3,6,9,12,15,18,21,24,27,30,33] }
        ],
        cardNumber: { start: 0, length: 32 }
      },
      {
        name: "(36) 36bit test",
        length: 36,
        parityBits: [
          { position: 1, type: 'even', range: [1, 17] },
          { position: 36, type: 'odd', range: [18, 35] }
        ],
        siteCode: { start: 1, length: 18 },
        cardNumber: { start: 19, length: 16 }
      },
      {
        name: "(37) HID Farpointe 37bit with Site Code - (H10304)",
        length: 37,
        parityBits: [
          { position: 1, type: 'even', range: [1, 18] },
          { position: 37, type: 'odd', range: [18, 36] }
        ],
        siteCode: { start: 1, length: 16 },
        cardNumber: { start: 17, length: 19 }
      },
      {
        name: "(37) HID 37 Bit (H10302)",
        length: 37,
        parityBits: [
          { position: 2, type: 'even', range: [1, 18] },
          { position: 37, type: 'odd', range: [19, 36] }
        ],
        cardNumber: { start: 1, length: 35 }
      },
      {
        name: "(37) HID generic 37bit",
        length: 37,
        parityBits: [
          { position: 1, type: 'even', bits: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21] },
          { position: 4, type: 'even', bits: [7,8,11,12,15,16,19,20,23,24,27,28,31,32,35,36] },
          { position: 3, type: 'odd', bits: [6,7,10,11,14,15,18,19,22,23,26,27,30,31,34,35] }
        ],
        cardNumber: { start: 4, length: 32 },
      },
      {
        name: "(37) AWID RS2 34bit",
        length: 37,
        parityBits: [
          { position: 1, type: 'even', range: [1, 16] },
          { position: 34, type: 'odd', range: [17, 33] }
        ],
        siteCode: { start: 1, length: 8 },
        cardNumber: { start: 9, length: 24 }
      },
      {
        name: "(37) PointGaurd MDI 37bit",
        length: 37,
        parityBits: [
          { position: 1, type: 'even', range: [1, 18] },
          { position: 37, type: 'odd', range: [18, 36] }
        ],
        siteCode: { start: 3, length: 4 },
        cardNumber: { start: 7, length: 29 }
      },
      {
        name: "(38) BQT 38bit",
        length: 38,
        parityBits: [
          { position: 1, type: 'even', range: [1, 17] },
          { position: 38, type: 'odd', range: [19, 37] }
        ],
        siteCode: { start: 1, length: 13 },
      },
      {
        name: "(38) ISCS 38bit",
        length: 38,
        parityBits: [
          { position: 1, type: 'even', range: [1, 17] },
          { position: 38, type: 'odd', range: [19, 37] }
        ],
        siteCode: { start: 5, length: 10 },
        cardNumber: { start: 15, length: 22 },
      },
      {
        name: "(39) Pyramid Wiegand Format",
        length: 39,
        parityBits: [
          { position: 1, type: 'even', range: [1, 18] },
          { position: 39, type: 'odd', range: [19, 38] }
        ],
        siteCode: { start: 1, length: 17 },
        cardNumber: { start: 18, length: 20 }
      },
      {
        name: "(40) HID 40bit Honeywell - (P10001)",
        length: 40,
        parityBits: [],
        siteCode: { start: 4, length: 12 },
        cardNumber: { start: 16, length: 16 },
      },
      {
        name: "(40) Casi-Rusco 40bit",
        length: 40,
        parityBits: [],
        cardNumber: { start: 1, length: 38 }
      },
      {
        name: "(40) XceedID RS2 40bit",
        length: 40,
        parityBits: [
          { position: 1, type: 'even', range: [1, 19] },
          { position: 40, type: 'odd', range: [1, 39] }
        ],
        siteCode: { start: 1, length: 10 },
        cardNumber: { start: 11, length: 28 }
      },
      {
        name: "(42) Lenel",
        length: 42,
        parityBits: [
          { position: 1, type: 'even', range: [1, 20] },
          { position: 42, type: 'odd', range: [21, 40] }
        ],
        siteCode: { start: 0, length: 14 },
        cardNumber: { start: 14, length: 12 }
      },
      {
        name: "(46) DCAC",
        length: 46,
        parityBits: [],
        siteCode: { start: 7, length: 14 },
        cardNumber: { start: 21, length: 24 }
      },
      {
        name: "(48) HID 37bit FAC Code & CN - (H10304)",
        length: 48,
        parityBits: [
          { position: 12, type: 'even', range: [12, 28] },
          { position: 48, type: 'odd', range: [29, 47] }
        ],
        siteCode: { start: 12, length: 16 },
        cardNumber: { start: 28, length: 19 }
      },
      {
        name: "(48) HUGHES ID 37bit - (H10302)",
        length: 48,
        parityBits: [
          { position: 12, type: 'even', range: [12, 28] },
          { position: 48, type: 'odd', range: [29, 47] }
        ],
        cardNumber: { start: 12, length: 35 }
      },
      {
        name: "(48) HID 48bit Corporate 1000 - (H2004064)",
        length: 48,
        parityBits: [
          { position: 2, type: 'even', bits: [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34] },
          { position: 48, type: 'odd', bits: [2,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33] },
          { position: 1, type: 'odd', range: [1, 46] }
        ],
        companyIdCode: { start: 2, length: 22 },  // NOTE: New field type "companyIdCode"
        cardNumber: { start: 24, length: 23 }
      },
      {
        name: "(56) Inner Range SIFER 56bit - (I941747A)",
        length: 56,
        parityBits: [],
        siteCode: { start: 0, length: 24 },
        cardNumber: { start: 24, length: 32 }
      },
      {
        name: "(56) 7byte CSN 56bit",
        length: 56,
        parityBits: [],
        cardNumber: { start: 0, length: 56 } 
      },
      {
        name: "(56) iCLASS truncated CSN 56bit",
        length: 56,
        parityBits: [],
        cardNumber: { start: 0, length: 56 },  // NOTE: Uses csn field
      },
      {
        name: "(58) TWIC / CAC Wiegand 58 bit format",
        length: 58,
        parityBits: [
          { position: 1, type: 'even', range: [1, 28] },
          { position: 58, type: 'odd', range: [29, 57] }
        ],
        agencyCode: { start: 1, length: 14 },       // NOTE: New field type
        systemCode: { start: 15, length: 14 },      // NOTE: New field type
        credentialCode: { start: 29, length: 20 },  // NOTE: New field type
        credentialSeries: { start: 49, length: 4 }, // NOTE: New field type
        individualSeriesIssue: { start: 53, length: 4 } // NOTE: New field type
      },
      {
        name: "(64) TWIC / CAC Wiegand 56-bit format(without parity) with Transaction Status Messages (total of 64 bits)",
        length: 64,
        parityBits: [],
        agencyCode: { start: 0, length: 14 },
        systemCode: { start: 14, length: 14 },
        credentialCode: { start: 28, length: 20 },
        credentialSeries: { start: 48, length: 4 },
        individualSeriesIssue: { start: 52, length: 4 },
        transactionStatusMessages: { start: 56, length: 7 }  // NOTE: New field type
      },
      {
        name: "(64) 8byte iCLASS CSN 64bit",
        length: 64,
        parityBits: [],
        cardNumber: { start: 0, length: 64 },
      },
      {
        name: "(75) 75bit PIV",
        length: 75,
        parityBits: [
          { position: 1, type: 'even', range: [1, 37] },
          { position: 75, type: 'odd', range: [38, 74] }
        ],
        siteCode: { start: 15, length: 14 },
        cardNumber: { start: 29, length: 20 },
        agencyCode: { start: 1, length: 14 },
        expirationDate: { start: 49, length: 25 }  // NOTE: New field type
      },
      {
        name: "(75) pivClass 75bit",
        length: 75,
        parityBits: [
          { position: 1, type: 'even', range: [1, 37] },
          { position: 75, type: 'odd', range: [38, 74] }
        ],
        siteCode: { start: 15, length: 14 },
        cardNumber: { start: 29, length: 20 },
        agencyCode: { start: 1, length: 14 },
        expirationDate: { start: 49, length: 25 }
      }
    ]
  }
};
