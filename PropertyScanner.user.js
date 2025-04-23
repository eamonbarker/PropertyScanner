// ==UserScript==
// @name         Property Data Fetcher V2.6 with Default Browser Headers
// @namespace    http://tampermonkey.net/
// @version      2.6
// @description  Fetch property data, display modern insights with dynamic updates, larger graphs, period toggles, and investment snapshot
// @author       You
// @match        https://www.realestate.com.au/property-*
// @grant        GM.xmlHttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/js/all.min.js
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// ==/UserScript==

(function() {
    'use strict';

    // CSS styles for modern UI with floating bar
    const styles = `
        <style>
            #property-insights-bar {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                background-color: #fff;
                border-bottom: 1px solid #e5e7eb;
                z-index: 1000;
                padding: 0.5rem 1rem;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            }
            #property-insights {
                font-family: 'Arial', sans-serif;
                transition: all 0.3s ease;
                position: fixed;
                top: 48px; /* Adjust based on bar height */
                left: 0;
                width: 100%;
                background-color: #fff;
                border-bottom: 1px solid #e5e7eb;
                z-index: 999;
                max-height: 80vh;
                overflow-y: auto;
            }
            #property-insights button, #property-insights select, #property-insights input {
                transition: all 0.3s ease;
            }
            #property-insights .grid {
                display: grid;
                gap: 1rem;
            }
            #property-insights .grid-cols-2 {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            #property-insights .grid-cols-1 {
                grid-template-columns: 1fr;
            }
            #property-insights .md\\:grid-cols-2 {
                @media (min-width: 768px) {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
            }
            #property-insights .lg\\:grid-cols-4 {
                @media (min-width: 1024px) {
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                }
            }
            #property-insights .col-span-2 {
                grid-column: span 2 / span 2;
            }
            #property-insights .flex {
                display: flex;
            }
            #property-insights .justify-between {
                justify-content: space-between;
            }
            #property-insights .items-center {
                align-items: center;
            }
            #property-insights .space-x-2 > * + * {
                margin-left: 0.5rem;
            }
            #property-insights .mb-4 {
                margin-bottom: 1rem;
            }
            #property-insights .mt-4 {
                margin-top: 1rem;
            }
            #property-insights .p-4 {
                padding: 1rem;
            }
            #property-insights .bg-white {
                background-color: #fff;
            }
            #property-insights .bg-gray-50 {
                background-color: #f9fafb;
            }
            #property-insights .bg-blue-50 {
                background-color: #eff6ff;
            }
            #property-insights .bg-green-50 {
                background-color: #f0fdf4;
            }
            #property-insights .rounded-lg {
                border-radius: 0.5rem;
            }
            #property-insights .shadow {
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            }
            #property-insights .shadow-2xl {
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            }
            #property-insights .border {
                border-width: 1px;
            }
            #property-insights .border-gray-200 {
                border-color: #e5e7eb;
            }
            #property-insights .text-gray-800 {
                color: #1f2937;
            }
            #property-insights .text-gray-700 {
                color: #374151;
            }
            #property-insights .text-gray-500 {
                color: #6b7280;
            }
            #property-insights .text-green-600 {
                color: #16a34a;
            }
            #property-insights .text-red-600 {
                color: #dc2626;
            }
            #property-insights .text-lg {
                font-size: 1.125rem;
                line-height: 1.75rem;
            }
            #property-insights .text-sm {
                font-size: 0.875rem;
                line-height: 1.25rem;
            }
            #property-insights .text-xs {
                font-size: 0.75rem;
                line-height: 1rem;
            }
            #property-insights .font-bold {
                font-weight: 700;
            }
            #property-insights .font-semibold {
                font-weight: 600;
            }
            #property-insights .font-medium {
                font-weight: 500;
            }
            #property-insights .italic {
                font-style: italic;
            }
            #property-insights .border-b {
                border-bottom-width: 1px;
            }
            #property-insights .pb-2 {
                padding-bottom: 0.5rem;
            }
            #property-insights .mb-2 {
                margin-bottom: 0.5rem;
            }
            #property-insights .text-center {
                text-align: center;
            }
            #property-insights .hidden {
                display: none;
            }
            #property-insights .w-full {
                width: 100%;
            }
            #property-insights .w-32 {
                width: 8rem;
            }
            #property-insights .max-w-2xl {
                max-width: 42rem;
            }
            #property-insights .focus\\:outline-none:focus {
                outline: 2px solid transparent;
                outline-offset: 2px;
            }
            #property-insights .focus\\:ring-2:focus {
                --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
                --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
                box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
            }
            #property-insights .focus\\:ring-blue-500:focus {
                --tw-ring-opacity: 1;
                --tw-ring-color: rgba(59, 130, 246, var(--tw-ring-opacity));
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);

    // Function to extract address from realestate.com.au page
    function getAddress() {
        console.log('Attempting to extract address...');
        let addressElement = document.querySelector('h1, [data-testid="listing-details__listing-summary"], .listing-details__address, .address');
        let address = addressElement ? addressElement.textContent.trim() : null;
        if (address) {
            console.log('Address found: ', address);
        } else {
            console.error('Address not found on page');
        }
        return address;
    }

    // Function to parse address and extract suburb, state, and postcode
    function parseAddress(address) {
        if (!address) return { suburb: null, state: null, postcode: null };
        console.log('Parsing address: ', address);
        let match = address.match(/,\s*([^,]+?)\s*,\s*(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\s*(\d{4})$/i) ||
                   address.match(/,\s*([^,]+?)\s*(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\s*(\d{4})$/i);
        if (match) {
            let suburb = match[1].trim().toLowerCase().replace(/ /g, '-');
            let state = match[2].toLowerCase();
            let postcode = match[3];
            console.log('Parsed - Suburb: ', suburb, 'State: ', state, 'Postcode: ', postcode);
            return { suburb, state, postcode };
        } else {
            console.error('Address format invalid');
            return { suburb: null, state: null, postcode: null };
        }
    }

    // Function to get PID from suggest.realestate.com.au API
    function getPID(address, callback) {
        console.log('Fetching PID for address: ', address);
        let suggestUrl = 'https://suggest.realestate.com.au/consumer-suggest/suggestions?max=6&type=address%2Csuburb%2Cpostcode%2Cstate%2Cregion&src=reax-multi-intent-search-modal&query=' + encodeURIComponent(address);
        console.log('Suggest API URL: ', suggestUrl);

        GM.xmlHttpRequest({
            method: 'GET',
            url: suggestUrl,
            onload: function(response) {
                console.log('Suggest API response status: ', response.status);
                if (response.status === 200) {
                    try {
                        let data = JSON.parse(response.responseText);
                        console.log('Suggest API response data: ', data);
                        let suggestions = data._embedded.suggestions;
                        if (suggestions.length > 0) {
                            let pid = suggestions[0].id;
                            let source = suggestions[0].source;
                            console.log('PID found: ', pid, 'Source: ', source);
                            callback(pid, source);
                        } else {
                            console.error('No suggestions found in API response');
                            callback(null, null);
                        }
                    } catch (e) {
                        console.error('Error parsing API response: ', e);
                        callback(null, null);
                    }
                } else {
                    console.error('Suggest API request failed with status: ', response.status);
                    callback(null, null);
                }
            },
            onerror: function(err) {
                console.error('Suggest API request error: ', err);
                callback(null, null);
            }
        });
    }

    // Function to construct property.com.au URL
    function constructPropertyUrl(pid, source) {
        console.log('Constructing property URL with PID: ', pid, 'Source: ', source);
        if (!pid || !source) {
            console.error('Cannot construct URL: PID or source missing');
            return null;
        }
        let state = source.state.toLowerCase();
        let suburb = source.suburb.toLowerCase().replace(/ /g, '-');
        let postcode = source.postcode;
        let street = source.street.toLowerCase().replace(/ /g, '-');
        let streetType = source.streetType.toLowerCase();
        let streetNumber = source.streetNumber;
        let url = `https://www.property.com.au/${state}/${suburb}-${postcode}/${street}-${streetType}/${streetNumber}-pid-${pid}/`;
        console.log('Constructed property URL: ', url);
        return url;
    }

    // Function to extract price and rental data from realestate.com.au as a fallback
    function getFallbackData() {
        console.log('Attempting to extract fallback data from realestate.com.au...');
        let price = 'N/A';
        let rental = 'N/A';

        let priceSelectors = [
            '[data-testid="listing-details__summary-title"]',
            '.listing-details__price',
            '.price',
            '[class*="price"]',
            '[id*="price"]',
            'h2, h3, h4, h5, h6',
            '.property-price',
            '[data-testid="listing-price"]'
        ];

        for (let selector of priceSelectors) {
            let priceElement = document.querySelector(selector);
            if (priceElement) {
                let priceText = priceElement.textContent.trim();
                let priceMatch = priceText.match(/\$[\d,]+(?:\.\d{2})?(?:\s*(?:to|-)\s*\$[\d,]+(?:\.\d{2})?)?/i);
                if (priceMatch) {
                    price = priceMatch[0];
                    console.log('Fallback price extracted: ', price);
                    break;
                }
            }
        }

        let rentalSelectors = [
            '.listing-details__rental-estimate',
            '.rental-estimate',
            '[data-testid="listing-details__rental-estimate"]',
            '[class*="rental"]',
            '[id*="rental"]',
            'p, div, span',
            '.estimated-rent',
            '[data-testid="rental-estimate"]'
        ];

        for (let selector of rentalSelectors) {
            let rentalElement = document.querySelector(selector);
            if (rentalElement) {
                let rentalText = rentalElement.textContent.trim();
                let rentalMatch = rentalText.match(/\$[\d,]+(?:\.\d{2})?\s*(?:\/|-|\sper\s)(?:week|pw|weekly)/i);
                if (rentalMatch) {
                    rental = rentalMatch[0];
                    console.log('Fallback rental extracted: ', rental);
                    break;
                }
            }
        }

        if (price === 'N/A' || rental === 'N/A') {
            let bodyText = document.body.textContent;
            if (price === 'N/A') {
                let priceMatch = bodyText.match(/\$[\d,]+(?:\.\d{2})?(?:\s*(?:to|-)\s*\$[\d,]+(?:\.\d{2})?)?(?=\s*(?:[^0-9]|$))/i);
                price = priceMatch ? priceMatch[0] : 'N/A';
                console.log('Fallback price extracted from body text: ', price);
            }
            if (rental === 'N/A') {
                let rentalMatch = bodyText.match(/\$[\d,]+(?:\.\d{2})?\s*(?:\/|-|\sper\s)(?:week|pw|weekly)(?=\s*(?:[^0-9]|$))/i);
                rental = rentalMatch ? rentalMatch[0] : 'N/A';
                console.log('Fallback rental extracted from body text: ', rental);
            }
        }

        return { price, rental };
    }

    // Function to fetch data from property.com.au using default browser headers
    function fetchPropertyData(url, callback) {
        console.log('Fetching data from property.com.au: ', url);
        GM.xmlHttpRequest({
            method: 'GET',
            url: url,
            onload: function(response) {
                console.log('Property.com.au response status: ', response.status);
                if (response.status === 200) {
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(response.responseText, 'text/html');
                    let priceElements = doc.querySelectorAll('[data-testid="valuation-sub-brick-price-text"]');
                    let subtitleElements = doc.querySelectorAll('[data-testid="valuation-sub-brick-price-subtitle"]');

                    let price = 'N/A';
                    let rental = 'N/A';

                    if (priceElements.length >= 1) {
                        price = priceElements[0].textContent.trim();
                    }
                    if (priceElements.length >= 2 && subtitleElements.length >= 2) {
                        rental = `${priceElements[1].textContent.trim()} ${subtitleElements[1].textContent.trim()}`;
                    }

                    if (price === 'N/A') {
                        let text = doc.body.textContent;
                        let priceMatch = text.match(/\$[\d,]+(?:\.\d{2})?(?:\s*(?:to|-)\s*\$[\d,]+(?:\.\d{2})?)?/i);
                        price = priceMatch ? priceMatch[0] : 'N/A';
                    }
                    if (rental === 'N/A') {
                        let text = doc.body.textContent;
                        let rentalMatch = text.match(/\$[\d,]+(?:\.\d{2})?\s*(?:\/|-|\sper\s)(?:week|pw|weekly)/i);
                        rental = rentalMatch ? rentalMatch[0] : 'N/A';
                    }

                    console.log('Price extracted: ', price);
                    console.log('Rental estimate extracted: ', rental);
                    callback(price, rental);
                } else {
                    console.error('Property.com.au request failed with status: ', response.status);
                    console.log('Falling back to realestate.com.au data...');
                    let fallbackData = getFallbackData();
                    callback(fallbackData.price, fallbackData.rental);
                }
            },
            onerror: function(err) {
                console.error('Property.com.au request error: ', err);
                console.log('Falling back to realestate.com.au data...');
                let fallbackData = getFallbackData();
                callback(fallbackData.price, fallbackData.rental);
            },
            ontimeout: function() {
                console.error('Property.com.au request timed out');
                console.log('Falling back to realestate.com.au data...');
                let fallbackData = getFallbackData();
                callback(fallbackData.price, fallbackData.rental);
            },
            timeout: 15000
        });
    }

    // Function to fetch suburb growth data from yourinvestmentpropertymag.com.au dynamically
    function fetchSuburbGrowth(state, suburb, postcode, callback) {
        if (!state || !suburb || !postcode) {
            console.error('Missing state, suburb, or postcode for suburb growth fetch');
            callback(0.1437);
            return;
        }
        const url = `https://www.yourinvestmentpropertymag.com.au/top-suburbs/${state}/${postcode}-${suburb}`;
        console.log('Fetching suburb growth from: ', url);
        GM.xmlHttpRequest({
            method: 'GET',
            url: url,
            onload: function(response) {
                console.log('yourinvestmentpropertymag.com.au response status: ', response.status);
                if (response.status === 200) {
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(response.responseText, 'text/html');
                    let text = doc.body.textContent;
                    let growthMatch = text.match(/annual capital growth of (\d+\.\d+)%/i);
                    let growthRate = growthMatch ? parseFloat(growthMatch[1]) / 100 : 0.1437;
                    console.log('Extracted suburb growth rate: ', growthRate);
                    callback(growthRate);
                } else {
                    console.warn(`yourinvestmentpropertymag.com.au request failed with status: ${response.status}. Using default growth rate.`);
                    callback(0.1437);
                }
            },
            onerror: function(err) {
                console.warn('yourinvestmentpropertymag.com.au request error: ', err, '. Using default growth rate.');
                callback(0.1437);
            }
        });
    }

    // Function to calculate tax based on Australian tax brackets (2011 rates)
    function calculateTax(income) {
        if (income <= 6000) return 0;
        if (income <= 35000) return (income - 6000) * 0.15;
        if (income <= 80000) return 4350 + (income - 35000) * 0.3;
        if (income <= 180000) return 17850 + (income - 80000) * 0.38;
        return 55850 + (income - 180000) * 0.45;
    }

    // Function to calculate stamp duty dynamically based on state
    function calculateStampDuty(price, state) {
        state = state ? state.toLowerCase() : 'qld';
        if (state === 'qld') {
            if (price <= 5000) return 0;
            if (price <= 75000) return price * 0.015;
            if (price <= 540000) return 1050 + (price - 75000) * 0.035;
            if (price <= 1000000) return 17325 + (price - 540000) * 0.045;
            return 38025 + (price - 1000000) * 0.0575;
        } else {
            console.warn(`Stamp duty calculation for state ${state} not implemented; using QLD rates`);
            if (price <= 5000) return 0;
            if (price <= 75000) return price * 0.015;
            if (price <= 540000) return 1050 + (price - 75000) * 0.035;
            if (price <= 1000000) return 17325 + (price - 540000) * 0.045;
            return 38025 + (price - 1000000) * 0.0575;
        }
    }

    // Function to calculate investment metrics
    function calculateMetrics(priceStr, rentalStr, config, state, suburb, postcode, callback) {
        console.log('Calculating investment metrics for Price: ', priceStr, 'Rental: ', rentalStr);

        let priceMatch = priceStr.match(/\$?([\d,]+)/);
        let price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
        let weeklyRentMatch = rentalStr.match(/\$?([\d,]+)/);
        let weeklyRent = weeklyRentMatch ? parseFloat(weeklyRentMatch[1].replace(/,/g, '')) : 0;
        let annualRent = weeklyRent * 52;

        let defaultMetrics = {
            rentalYield: 'N/A',
            preTaxCashFlow: 'N/A',
            annualCashFlow: 'N/A',
            weeklyCashFlow: 'N/A',
            fortnightlyCashFlow: 'N/A',
            monthlyCashFlow: 'N/A',
            taxSavingsA: 'N/A',
            taxSavingsB: 'N/A',
            totalCosts: 'N/A',
            suburbGrowth: 'N/A',
            equity: 'N/A',
            lvr: 'N/A',
            breakEvenYear: 'N/A',
            totalCost: 'N/A',
            depreciationBuildings: 'N/A',
            depreciationFittings: 'N/A',
            irr3: 'N/A',
            irr5: 'N/A',
            irr10: 'N/A',
            cashOnCashBeforeTax: 'N/A',
            cashOnCashAfterTax: 'N/A',
            futurePrice3: 'N/A',
            futurePrice5: 'N/A',
            futurePrice10: 'N/A',
            futureRent3: 'N/A',
            futureRent5: 'N/A',
            futureRent10: 'N/A',
            futureValues: [],
            annualProfitLoss: [],
            cumulativeProfitLoss: [],
            suburbGrowthRate: 0.1437,
            interestRate: 0.0622,
            managementFee: 0.08,
            strata: 5000
        };

        if (price === 0 || weeklyRent === 0) {
            console.error(`Invalid price or rental data for calculations. Price: ${priceStr}, Rental: ${rentalStr}`);
            callback(defaultMetrics);
            return;
        }

        fetchSuburbGrowth(state, suburb, postcode, function(suburbGrowthRate) {
            let rentalGrowthRate = config.rentalGrowthRate || 0.03;
            let yieldType = config.yieldType || 'gross';
            let interestRate = config.interestRate || 0.0622;
            let vacancyRate = config.vacancyRate || 0.05;
            let managementFee = config.managementFee || 0.08;
            let depreciationBuildingsRate = config.depreciationBuildingsRate || 0.04;
            let constructionCost = config.constructionCost || price * 0.4;
            let fittingsValue = config.fittingsValue || 10000;
            let incomeA = config.incomeA || 215000;
            let incomeB = config.incomeB || 110000;
            let allocationA = config.allocationA || 0.5;
            let allocationB = config.allocationB || 0.5;
            let lvrRate = config.lvrRate || 0.8;

            let stampDuty = calculateStampDuty(price, state);
            let legalFees = 1500;
            let buildingInspections = 400;
            let registrationOfTitle = 500;
            let searchFees = 200;
            let registrationOfMortgage = 200;
            let loanApplicationFee = 500;
            let totalPurchaseCosts = stampDuty + legalFees + buildingInspections + registrationOfTitle + searchFees + registrationOfMortgage + loanApplicationFee;
            let totalCost = price + totalPurchaseCosts;

            let rentalYield;
            let netAnnualRent = annualRent * (1 - vacancyRate) * (1 - managementFee);
            if (yieldType === 'gross') {
                rentalYield = ((annualRent / price) * 100).toFixed(2) + '%';
            } else {
                rentalYield = ((netAnnualRent / price) * 100).toFixed(2) + '%';
            }

            let loanAmount = price * lvrRate;
            let interest = loanAmount * interestRate;
            let propertyManagement = annualRent * managementFee;
            let strata = 5000;
            let councilRates = 1200;
            let waterRates = 800;
            let insurance = 1500;
            let maintenance = 2950;
            let landTax = price <= 999999 ? 500 + (price - 600000) * 0.01 : 1500 + (price - 1000000) * 0.0165;
            let totalCosts = interest + propertyManagement + strata + councilRates + waterRates + insurance + maintenance + landTax;

            let netRent = annualRent * (1 - vacancyRate);
            let preTaxCashFlow = netRent - totalCosts;

            let depreciationBuildings = constructionCost * depreciationBuildingsRate;
            let depreciationFittings = fittingsValue * 0.3;
            let totalDepreciation = depreciationBuildings + depreciationFittings;

            let deductibleExpenses = totalCosts + totalDepreciation;
            let taxLoss = annualRent - deductibleExpenses;
            let taxSavingsA = 0, taxSavingsB = 0;
            if (taxLoss < 0) {
                let lossA = Math.abs(taxLoss) * allocationA;
                let lossB = Math.abs(taxLoss) * allocationB;
                let preTaxA = calculateTax(incomeA);
                let preTaxB = calculateTax(incomeB);
                let postTaxA = calculateTax(Math.max(0, incomeA - lossA));
                let postTaxB = calculateTax(Math.max(0, incomeB - lossB));
                taxSavingsA = preTaxA - postTaxA;
                taxSavingsB = preTaxB - postTaxB;
            }
            let annualCashFlow = preTaxCashFlow + taxSavingsA + taxSavingsB;
            let weeklyCashFlow = annualCashFlow / 52;
            let fortnightlyCashFlow = annualCashFlow / 26;
            let monthlyCashFlow = annualCashFlow / 12;

            let initialInvestment = price * (1 - lvrRate) + totalPurchaseCosts;
            let cashOnCashBeforeTax = ((netRent - interest) / initialInvestment * 100).toFixed(2) + '%';
            let cashOnCashAfterTax = ((netRent - interest + taxSavingsA + taxSavingsB) / initialInvestment * 100).toFixed(2) + '%';

            let suburbGrowth = `${(suburbGrowthRate * 100).toFixed(2)}% (Fetched from yourinvestmentpropertymag.com.au)`;

            let equity = price - loanAmount;
            let lvr = (lvrRate * 100).toFixed(2) + '%';

            let futurePrice3 = (price * Math.pow(1 + suburbGrowthRate, 3)).toFixed(0);
            let futurePrice5 = (price * Math.pow(1 + suburbGrowthRate, 5)).toFixed(0);
            let futurePrice10 = (price * Math.pow(1 + suburbGrowthRate, 10)).toFixed(0);
            let futureRent3 = (weeklyRent * Math.pow(1 + rentalGrowthRate, 3)).toFixed(0);
            let futureRent5 = (weeklyRent * Math.pow(1 + rentalGrowthRate, 5)).toFixed(0);
            let futureRent10 = (weeklyRent * Math.pow(1 + rentalGrowthRate, 10)).toFixed(0);

            let futureValues = [];
            for (let year = 0; year <= 10; year++) {
                futureValues.push(Math.round(price * Math.pow(1 + suburbGrowthRate, year)));
            }

            let annualProfitLoss = [];
            let cumulativeProfitLoss = [];
            let cumulative = 0;
            for (let year = 1; year <= 10; year++) {
                let futureAnnualRent = annualRent * Math.pow(1 + rentalGrowthRate, year);
                let futureNetRent = futureAnnualRent * (1 - vacancyRate);
                let futurePreTaxCashFlow = futureNetRent - totalCosts;
                let futureDepreciation = totalDepreciation * Math.pow(0.7, year);
                let futureTaxLoss = futureAnnualRent - (totalCosts + futureDepreciation);
                let futureTaxSavingsA = 0, futureTaxSavingsB = 0;
                if (futureTaxLoss < 0) {
                    let lossA = Math.abs(futureTaxLoss) * allocationA;
                    let lossB = Math.abs(futureTaxLoss) * allocationB;
                    futureTaxSavingsA = calculateTax(incomeA) - calculateTax(Math.max(0, incomeA - lossA));
                    futureTaxSavingsB = calculateTax(incomeB) - calculateTax(Math.max(0, incomeB - lossB));
                }
                let futureAfterTaxCashFlow = futurePreTaxCashFlow + futureTaxSavingsA + futureTaxSavingsB;
                annualProfitLoss.push(Math.round(futureAfterTaxCashFlow));
                cumulative += futureAfterTaxCashFlow;
                cumulativeProfitLoss.push(Math.round(cumulative));
            }

            let breakEvenYear = 'N/A';
            for (let year = 1; year <= 15; year++) {
                let futureAnnualRent = annualRent * Math.pow(1 + rentalGrowthRate, year);
                let futureNetRent = futureAnnualRent * (1 - vacancyRate);
                let futurePreTaxCashFlow = futureNetRent - totalCosts;
                let futureTaxLoss = futureAnnualRent - (totalCosts + totalDepreciation * Math.pow(0.7, year));
                let futureTaxSavingsA = 0, futureTaxSavingsB = 0;
                if (futureTaxLoss < 0) {
                    let lossA = Math.abs(futureTaxLoss) * allocationA;
                    let lossB = Math.abs(futureTaxLoss) * allocationB;
                    futureTaxSavingsA = calculateTax(incomeA) - calculateTax(Math.max(0, incomeA - lossA));
                    futureTaxSavingsB = calculateTax(incomeB) - calculateTax(Math.max(0, incomeB - lossB));
                }
                let futureAfterTaxCashFlow = futurePreTaxCashFlow + futureTaxSavingsA + futureTaxSavingsB;
                if (futureAfterTaxCashFlow > 0) {
                    breakEvenYear = year;
                    break;
                }
            }

            let saleCosts = 0.025;
            let finalValue3 = futurePrice3 * (1 - saleCosts) - loanAmount;
            let irr3 = calculateIRR(initialInvestment, annualProfitLoss.slice(0, 3), finalValue3);

            let finalValue5 = futurePrice5 * (1 - saleCosts) - loanAmount;
            let irr5 = calculateIRR(initialInvestment, annualProfitLoss.slice(0, 5), finalValue5);

            let finalValue10 = futurePrice10 * (1 - saleCosts) - loanAmount;
            let irr10 = calculateIRR(initialInvestment, annualProfitLoss, finalValue10);

            callback({
                rentalYield: rentalYield || 'N/A',
                preTaxCashFlow: isFinite(preTaxCashFlow) ? preTaxCashFlow.toFixed(2) : 'N/A',
                annualCashFlow: isFinite(annualCashFlow) ? annualCashFlow.toFixed(2) : 'N/A',
                weeklyCashFlow: isFinite(weeklyCashFlow) ? weeklyCashFlow.toFixed(2) : 'N/A',
                fortnightlyCashFlow: isFinite(fortnightlyCashFlow) ? fortnightlyCashFlow.toFixed(2) : 'N/A',
                monthlyCashFlow: isFinite(monthlyCashFlow) ? monthlyCashFlow.toFixed(2) : 'N/A',
                taxSavingsA: isFinite(taxSavingsA) ? taxSavingsA.toFixed(2) : 'N/A',
                taxSavingsB: isFinite(taxSavingsB) ? taxSavingsB.toFixed(2) : 'N/A',
                totalCosts: isFinite(totalCosts) ? totalCosts.toFixed(2) : 'N/A',
                suburbGrowth: suburbGrowth || 'N/A',
                equity: isFinite(equity) ? `$${equity.toLocaleString()}` : 'N/A',
                lvr: lvr || 'N/A',
                breakEvenYear: breakEvenYear,
                totalCost: isFinite(totalCost) ? `$${totalCost.toLocaleString()}` : 'N/A',
                depreciationBuildings: isFinite(depreciationBuildings) ? `$${depreciationBuildings.toLocaleString()}` : 'N/A',
                depreciationFittings: isFinite(depreciationFittings) ? `$${depreciationFittings.toLocaleString()}` : 'N/A',
                irr3: isFinite(irr3) ? irr3.toFixed(2) + '%' : 'N/A',
                irr5: isFinite(irr5) ? irr5.toFixed(2) + '%' : 'N/A',
                irr10: isFinite(irr10) ? irr10.toFixed(2) + '%' : 'N/A',
                cashOnCashBeforeTax: cashOnCashBeforeTax || 'N/A',
                cashOnCashAfterTax: cashOnCashAfterTax || 'N/A',
                futurePrice3: isFinite(futurePrice3) ? `$${parseInt(futurePrice3).toLocaleString()}` : 'N/A',
                futurePrice5: isFinite(futurePrice5) ? `$${parseInt(futurePrice5).toLocaleString()}` : 'N/A',
                futurePrice10: isFinite(futurePrice10) ? `$${parseInt(futurePrice10).toLocaleString()}` : 'N/A',
                futureRent3: isFinite(futureRent3) ? `$${futureRent3}/week` : 'N/A',
                futureRent5: isFinite(futureRent5) ? `$${futureRent5}/week` : 'N/A',
                futureRent10: isFinite(futureRent10) ? `$${futureRent10}/week` : 'N/A',
                futureValues: futureValues,
                annualProfitLoss: annualProfitLoss,
                cumulativeProfitLoss: cumulativeProfitLoss,
                suburbGrowthRate: suburbGrowthRate,
                interestRate: interestRate,
                managementFee: managementFee,
                strata: strata
            });
        });
    }

    // Function to calculate IRR
    function calculateIRR(initialInvestment, annualCashFlows, finalValue) {
        if (!isFinite(initialInvestment) || !Array.isArray(annualCashFlows) || annualCashFlows.some(cf => !isFinite(cf)) || !isFinite(finalValue)) {
            return NaN;
        }
        let low = -0.5;
        let high = 0.5;
        let irr = 0;
        let maxIterations = 1000;
        let tolerance = 0.001;
        let years = annualCashFlows.length;

        for (let i = 0; i < maxIterations; i++) {
            irr = (low + high) / 2;
            let npv = -initialInvestment;
            for (let t = 0; t < years; t++) {
                npv += annualCashFlows[t] / Math.pow(1 + irr, t + 1);
            }
            npv += finalValue / Math.pow(1 + irr, years);

            if (Math.abs(npv) < tolerance) break;
            if (npv > 0) low = irr;
            else high = irr;
        }

        return irr * 100;
    }

    // Function to display data with modern UI
    function displayData(originalPrice, originalRental, address) {
        console.log('Displaying data - Price: ', originalPrice, 'Rental: ', originalRental);
        let { suburb, state, postcode } = parseAddress(address);

        let config = {
            rentalGrowthRate: GM_getValue('rentalGrowthRate', 0.03),
            yieldType: GM_getValue('yieldType', 'gross'),
            interestRate: GM_getValue('interestRate', 0.0622),
            vacancyRate: GM_getValue('vacancyRate', 0.05),
            managementFee: GM_getValue('managementFee', 0.08),
            depreciationBuildingsRate: GM_getValue('depreciationBuildingsRate', 0.04),
            constructionCost: GM_getValue('constructionCost', parseFloat(originalPrice.match(/\$([\d,]+)/)?.[1].replace(/,/g, '')) * 0.4 || 236000),
            fittingsValue: GM_getValue('fittingsValue', 10000),
            incomeA: GM_getValue('incomeA', 215000),
            incomeB: GM_getValue('incomeB', 110000),
            allocationA: GM_getValue('allocationA', 0.5),
            allocationB: GM_getValue('allocationB', 0.5),
            sensitivity: GM_getValue('sensitivity', false),
            lvrRate: GM_getValue('lvrRate', 0.8)
        };

        let currentPrice = originalPrice;
        let currentRental = originalRental;
        let currentPeriod = 'yearly';

        calculateMetrics(currentPrice, currentRental, config, state, suburb, postcode, function(metrics) {
            // Create the floating bar
            let barDiv = document.createElement('div');
            barDiv.id = 'property-insights-bar';
            barDiv.innerHTML = `
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-bold text-gray-800">Property Insights</h2>
                    <div>
                        <button id="toggleButton" class="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition duration-300">
                            <i class="fas fa-chevron-down mr-2"></i>Expand Insights
                        </button>
                        <button id="cogButton" class="ml-2 text-gray-600 hover:text-gray-800 transition duration-300">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                </div>
            `;

            // Create the insights panel (dropdown)
            let infoDiv = document.createElement('div');
            infoDiv.className = 'hidden bg-white p-4';
            infoDiv.id = 'property-insights';

            let summaryDiv = document.createElement('div');
            summaryDiv.className = 'text-gray-700';

            let detailsDiv = document.createElement('div');
            detailsDiv.className = 'hidden mt-4';

            let configDiv = document.createElement('div');
            configDiv.className = 'hidden mt-4 p-4 bg-gray-50 rounded-lg';
            configDiv.innerHTML = `
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Configuration</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Rental Growth Rate (%):</label>
                        <input type="number" id="rentalGrowthRate" value="${(config.rentalGrowthRate * 100).toFixed(2)}" step="0.01" class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Yield Type:</label>
                        <select id="yieldType" class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="gross" ${config.yieldType === 'gross' ? 'selected' : ''}>Gross</option>
                            <option value="net" ${config.yieldType === 'net' ? 'selected' : ''}>Net</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Interest Rate (%):</label>
                        <input type="number" id="interestRate" value="${(config.interestRate * 100).toFixed(2)}" step="0.01" class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Vacancy Rate (%):</label>
                        <input type="number" id="vacancyRate" value="${(config.vacancyRate * 100).toFixed(2)}" step="0.01" class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Management Fee (%):</label>
                        <input type="number" id="managementFee" value="${(config.managementFee * 100).toFixed(2)}" step="0.01" class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Depreciation Rate (Buildings, %):</label>
                        <input type="number" id="depreciationBuildingsRate" value="${(config.depreciationBuildingsRate * 100).toFixed(2)}" step="0.01" class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Construction Cost ($):</label>
                        <input type="number" id="constructionCost" value="${config.constructionCost}" step="1000" class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Fittings Value ($):</label>
                        <input type="number" id="fittingsValue" value="${config.fittingsValue}" step="1000" class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Income A ($):</label>
                        <input type="number" id="incomeA" value="${config.incomeA}" step="1000" class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Allocation A (%):</label>
                        <input type="number" id="allocationA" value="${(config.allocationA * 100).toFixed(2)}" step="1" class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Income B ($):</label>
                        <input type="number" id="incomeB" value="${config.incomeB}" step="1000" class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Allocation B (%):</label>
                        <input type="number" id="allocationB" value="${(config.allocationB * 100).toFixed(2)}" step="1" class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">LVR (%):</label>
                        <input type="number" id="lvrRate" value="${(config.lvrRate * 100).toFixed(2)}" step="1" class="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div class="flex items-center">
                        <label class="block text-sm font-medium text-gray-700 mr-2">Show Sensitivity Analysis:</label>
                        <input type="checkbox" id="sensitivity" ${config.sensitivity ? 'checked' : ''}>
                    </div>
                </div>
                <button id="saveConfig" class="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300">Save</button>
            `;

            function updateDisplay() {
                let worthBuying = parseFloat(metrics.annualCashFlow) > 0 && parseFloat(metrics.irr10) > 8 && parseFloat(metrics.cashOnCashAfterTax) > 8;
                let cashFlowColor = parseFloat(metrics.annualCashFlow) > 0 ? 'text-green-600' : 'text-red-600';
                let preTaxColor = parseFloat(metrics.preTaxCashFlow) > 0 ? 'text-green-600' : 'text-red-600';
                let irrColor = parseFloat(metrics.irr10) > 8 ? 'text-green-600' : 'text-red-600';
                let cocColor = parseFloat(metrics.cashOnCashAfterTax) > 8 ? 'text-green-600' : 'text-red-600';

                summaryDiv.innerHTML = `
                    <div class="grid grid-cols-2 gap-4">
                        <div class="p-4 bg-blue-50 rounded-lg">
                            <p class="font-semibold text-gray-800"><i class="fas fa-home mr-2"></i>Price:</p>
                            <p class="text-lg ${parseFloat(currentPrice.replace(/[^0-9.-]+/g,"")) > 0 ? 'text-gray-700' : 'text-red-600'}">${currentPrice}</p>
                        </div>
                        <div class="p-4 bg-blue-50 rounded-lg">
                            <p class="font-semibold text-gray-800"><i class="fas fa-money-bill-wave mr-2"></i>Rental Estimate:</p>
                            <p class="text-lg ${parseFloat(currentRental.replace(/[^0-9.-]+/g,"")) > 0 ? 'text-gray-700' : 'text-red-600'}">${currentRental}</p>
                        </div>
                        <div class="p-4 bg-blue-50 rounded-lg">
                            <p class="font-semibold text-gray-800"><i class="fas fa-percentage mr-2"></i>Rental Yield:</p>
                            <p class="text-lg text-gray-700">${metrics.rentalYield}</p>
                        </div>
                        <div class="p-4 bg-blue-50 rounded-lg">
                            <p class="font-semibold text-gray-800"><i class="fas fa-chart-line mr-2"></i>Suburb Growth:</p>
                            <p class="text-lg text-gray-700">${metrics.suburbGrowth}</p>
                        </div>
                        <div class="p-4 bg-blue-50 rounded-lg">
                            <p class="font-semibold text-gray-800"><i class="fas fa-hand-holding-usd mr-2"></i>Pre-Tax Cash Flow:</p>
                            <p class="text-lg ${preTaxColor}">$${parseFloat(metrics.preTaxCashFlow).toLocaleString()}</p>
                        </div>
                        <div class="p-4 bg-blue-50 rounded-lg">
                            <p class="font-semibold text-gray-800"><i class="fas fa-hand-holding-usd mr-2"></i>After-Tax Cash Flow:</p>
                            <p class="text-lg ${cashFlowColor}">$${parseFloat(metrics.annualCashFlow).toLocaleString()}</p>
                        </div>
                        <div class="p-4 bg-blue-50 rounded-lg">
                            <p class="font-semibold text-gray-800"><i class="fas fa-chart-pie mr-2"></i>10-Year IRR:</p>
                            <p class="text-lg ${irrColor}">${metrics.irr10}${config.sensitivity ? ` (Range: ${irr10Low} to ${irr10High})` : ''}</p>
                        </div>
                        <div class="p-4 bg-blue-50 rounded-lg">
                            <p class="font-semibold text-gray-800"><i class="fas fa-percentage mr-2"></i>Cash on Cash (After Tax):</p>
                            <p class="text-lg ${cocColor}">${metrics.cashOnCashAfterTax}</p>
                        </div>
                        <div class="col-span-2 p-4 bg-green-50 rounded-lg text-center">
                            <p class="font-semibold text-gray-800"><i class="fas fa-thumbs-${worthBuying ? 'up' : 'down'} mr-2"></i>Worth Buying?</p>
                            <p class="text-lg ${worthBuying ? 'text-green-600' : 'text-red-600'}">${worthBuying ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                `;

                let cashFlowDisplay;
                if (currentPeriod === 'weekly') {
                    cashFlowDisplay = `$${parseFloat(metrics.weeklyCashFlow).toLocaleString()}/week`;
                } else if (currentPeriod === 'fortnightly') {
                    cashFlowDisplay = `$${parseFloat(metrics.fortnightlyCashFlow).toLocaleString()}/fortnight`;
                } else if (currentPeriod === 'monthly') {
                    cashFlowDisplay = `$${parseFloat(metrics.monthlyCashFlow).toLocaleString()}/month`;
                } else {
                    cashFlowDisplay = `$${parseFloat(metrics.annualCashFlow).toLocaleString()}/year`;
                }

                detailsDiv.innerHTML = `
                    <div class="mb-4 flex justify-between items-center">
                        <div class="flex items-center space-x-2">
                            <label class="font-semibold text-gray-800">Price:</label>
                            <input id="priceInput" type="text" value="${currentPrice}" class="border rounded-lg p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div class="flex items-center space-x-2">
                            <label class="font-semibold text-gray-800">Rental (Weekly):</label>
                            <input id="rentalInput" type="text" value="${currentRental}" class="border rounded-lg p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div class="flex items-center space-x-2">
                            <label class="font-semibold text-gray-800">Period:</label>
                            <select id="periodSelect" class="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="weekly" ${currentPeriod === 'weekly' ? 'selected' : ''}>Weekly</option>
                                <option value="fortnightly" ${currentPeriod === 'fortnightly' ? 'selected' : ''}>Fortnightly</option>
                                <option value="monthly" ${currentPeriod === 'monthly' ? 'selected' : ''}>Monthly</option>
                                <option value="yearly" ${currentPeriod === 'yearly' ? 'selected' : ''}>Yearly</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="p-4 bg-gray-50 rounded-lg shadow">
                            <h4 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-2">Financial Overview</h4>
                            <p class="text-sm"><span class="font-medium">Price:</span> ${currentPrice}</p>
                            <p class="text-sm"><span class="font-medium">Total Cost (incl. fees):</span> ${metrics.totalCost}</p>
                            <p class="text-sm"><span class="font-medium">Rental Estimate:</span> ${currentRental}</p>
                            <p class="text-sm"><span class="font-medium">Rental Yield:</span> ${metrics.rentalYield}</p>
                            <p class="text-sm"><span class="font-medium">Pre-Tax Cash Flow:</span> $${parseFloat(metrics.preTaxCashFlow).toLocaleString()}</p>
                            <p class="text-sm"><span class="font-medium">After-Tax Cash Flow:</span> ${cashFlowDisplay}</p>
                            <p class="text-sm"><span class="font-medium">Break-Even Year:</span> ${metrics.breakEvenYear}</p>
                            <p class="text-sm"><span class="font-medium">Cumulative Profit/Loss (10 Yr):</span> $${metrics.cumulativeProfitLoss[9]?.toLocaleString()}</p>
                            <div class="mt-4">
                                <canvas id="profitLossChart" style="height: 200px;"></canvas>
                            </div>
                        </div>
                        <div class="p-4 bg-gray-50 rounded-lg shadow">
                            <h4 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-2">Tax & Deductions</h4>
                            <p class="text-sm"><span class="font-medium">Tax Savings A:</span> $${metrics.taxSavingsA}</p>
                            <p class="text-sm"><span class="font-medium">Tax Savings B:</span> $${metrics.taxSavingsB}</p>
                            <p class="text-sm"><span class="font-medium">Annual Costs:</span> $${metrics.totalCosts}</p>
                            <p class="text-sm"><span class="font-medium">Depreciation (Buildings):</span> ${metrics.depreciationBuildings}</p>
                            <p class="text-sm"><span class="font-medium">Depreciation (Fittings, Yr 1):</span> ${metrics.depreciationFittings}</p>
                        </div>
                        <div class="p-4 bg-gray-50 rounded-lg shadow">
                            <h4 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-2">Growth & Returns</h4>
                            <p class="text-sm"><span class="font-medium">Suburb Growth:</span> ${metrics.suburbGrowth}</p>
                            <p class="text-sm"><span class="font-medium">3-Year IRR:</span> ${metrics.irr3}</p>
                            <p class="text-sm"><span class="font-medium">5-Year IRR:</span> ${metrics.irr5}</p>
                            <p class="text-sm"><span class="font-medium">10-Year IRR:</span> ${metrics.irr10}${config.sensitivity ? ` (Range: ${irr10Low} to ${irr10High})` : ''}</p>
                            <p class="text-sm"><span class="font-medium">Cash on Cash (Before Tax):</span> ${metrics.cashOnCashBeforeTax}</p>
                            <p class="text-sm"><span class="font-medium">Cash on Cash (After Tax):</span> ${metrics.cashOnCashAfterTax}</p>
                            <div class="mt-4">
                                <canvas id="futureValueChart" style="height: 200px;"></canvas>
                            </div>
                        </div>
                        <div class="p-4 bg-gray-50 rounded-lg shadow">
                            <h4 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-2">Future Estimates</h4>
                            <p class="text-sm"><span class="font-medium">Est. Price (3 Yr):</span> ${metrics.futurePrice3}</p>
                            <p class="text-sm"><span class="font-medium">Est. Price (5 Yr):</span> ${metrics.futurePrice5}</p>
                            <p class="text-sm"><span class="font-medium">Est. Price (10 Yr):</span> ${metrics.futurePrice10}</p>
                            <p class="text-sm"><span class="font-medium">Est. Rent (3 Yr):</span> ${metrics.futureRent3}</p>
                            <p class="text-sm"><span class="font-medium">Est. Rent (5 Yr):</span> ${metrics.futureRent5}</p>
                            <p class="text-sm"><span class="font-medium">Est. Rent (10 Yr):</span> ${metrics.futureRent10}</p>
                        </div>
                        <div class="p-4 bg-gray-50 rounded-lg shadow">
                            <h4 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-2">Equity & Leverage</h4>
                            <p class="text-sm"><span class="font-medium">Equity:</span> ${metrics.equity}</p>
                            <p class="text-sm"><span class="font-medium">LVR:</span> ${metrics.lvr}</p>
                        </div>
                    </div>
                    <p class="mt-4 text-xs text-gray-500 italic">Note: Suburb growth fetched dynamically. Costs assume ${metrics.lvr} LVR, ${(metrics.interestRate * 100).toFixed(2)}% loan, ${(metrics.managementFee * 100).toFixed(2)}% management, $${metrics.strata.toLocaleString()} strata, etc.</p>
                `;

                setTimeout(() => {
                    let futureValueCanvas = detailsDiv.querySelector('#futureValueChart');
                    if (futureValueCanvas) {
                        let ctx = futureValueCanvas.getContext('2d');
                        new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: Array.from({length: 11}, (_, i) => `Year ${i}`),
                                datasets: [{
                                    label: 'Future Value ($)',
                                    data: metrics.futureValues,
                                    borderColor: '#007bff',
                                    fill: false
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: false,
                                        title: { display: true, text: 'Value ($)' }
                                    },
                                    x: {
                                        title: { display: true, text: 'Year' }
                                    }
                                }
                            }
                        });
                    }

                    let profitLossCanvas = detailsDiv.querySelector('#profitLossChart');
                    if (profitLossCanvas) {
                        let ctx = profitLossCanvas.getContext('2d');
                        new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: Array.from({length: 11}, (_, i) => `Year ${i}`),
                                datasets: [{
                                    label: 'Cumulative Profit/Loss ($)',
                                    data: [0, ...metrics.cumulativeProfitLoss],
                                    borderColor: '#ff5733',
                                    fill: false
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        title: { display: true, text: 'Profit/Loss ($)' }
                                    },
                                    x: {
                                        title: { display: true, text: 'Year' }
                                    }
                                }
                            }
                        });
                    }
                }, 0);
            }

            let irr10Low = 'N/A';
            let irr10High = 'N/A';
            if (config.sensitivity) {
                let configLow = { ...config, suburbGrowthRate: metrics.suburbGrowthRate - 0.02 };
                let configHigh = { ...config, suburbGrowthRate: metrics.suburbGrowthRate + 0.02 };
                calculateMetrics(currentPrice, currentRental, configLow, state, suburb, postcode, function(metricsLow) {
                    calculateMetrics(currentPrice, currentRental, configHigh, state, suburb, postcode, function(metricsHigh) {
                        irr10Low = metricsLow.irr10;
                        irr10High = metricsHigh.irr10;
                        updateDisplay();
                    });
                });
            } else {
                updateDisplay();
            }

            barDiv.querySelector('#toggleButton').onclick = function() {
                if (infoDiv.classList.contains('hidden')) {
                    infoDiv.classList.remove('hidden');
                    summaryDiv.classList.remove('hidden');
                    detailsDiv.classList.add('hidden');
                    configDiv.classList.add('hidden');
                    this.innerHTML = `<i class="fas fa-chevron-up mr-2"></i>Collapse Insights`;
                } else {
                    infoDiv.classList.add('hidden');
                    summaryDiv.classList.add('hidden');
                    detailsDiv.classList.add('hidden');
                    configDiv.classList.add('hidden');
                    this.innerHTML = `<i class="fas fa-chevron-down mr-2"></i>Expand Insights`;
                }
            };

            barDiv.querySelector('#cogButton').onclick = function() {
                if (configDiv.classList.contains('hidden')) {
                    infoDiv.classList.remove('hidden');
                    configDiv.classList.remove('hidden');
                    detailsDiv.classList.add('hidden');
                    summaryDiv.classList.add('hidden');
                    barDiv.querySelector('#toggleButton').innerHTML = `<i class="fas fa-chevron-down mr-2"></i>Expand Insights`;
                } else {
                    configDiv.classList.add('hidden');
                    summaryDiv.classList.remove('hidden');
                }
            };

            configDiv.querySelector('#saveConfig').onclick = function() {
                config.rentalGrowthRate = parseFloat(configDiv.querySelector('#rentalGrowthRate').value) / 100;
                config.yieldType = configDiv.querySelector('#yieldType').value;
                config.interestRate = parseFloat(configDiv.querySelector('#interestRate').value) / 100;
                config.vacancyRate = parseFloat(configDiv.querySelector('#vacancyRate').value) / 100;
                config.managementFee = parseFloat(configDiv.querySelector('#managementFee').value) / 100;
                config.depreciationBuildingsRate = parseFloat(configDiv.querySelector('#depreciationBuildingsRate').value) / 100;
                config.constructionCost = parseFloat(configDiv.querySelector('#constructionCost').value);
                config.fittingsValue = parseFloat(configDiv.querySelector('#fittingsValue').value);
                config.incomeA = parseFloat(configDiv.querySelector('#incomeA').value);
                config.incomeB = parseFloat(configDiv.querySelector('#incomeB').value);
                config.allocationA = parseFloat(configDiv.querySelector('#allocationA').value) / 100;
                config.allocationB = parseFloat(configDiv.querySelector('#allocationB').value) / 100;
                config.lvrRate = parseFloat(configDiv.querySelector('#lvrRate').value) / 100;
                config.sensitivity = configDiv.querySelector('#sensitivity').checked;

                GM_setValue('rentalGrowthRate', config.rentalGrowthRate);
                GM_setValue('yieldType', config.yieldType);
                GM_setValue('interestRate', config.interestRate);
                GM_setValue('vacancyRate', config.vacancyRate);
                GM_setValue('managementFee', config.managementFee);
                GM_setValue('depreciationBuildingsRate', config.depreciationBuildingsRate);
                GM_setValue('constructionCost', config.constructionCost);
                GM_setValue('fittingsValue', config.fittingsValue);
                GM_setValue('incomeA', config.incomeA);
                GM_setValue('incomeB', config.incomeB);
                GM_setValue('allocationA', config.allocationA);
                GM_setValue('allocationB', config.allocationB);
                GM_setValue('lvrRate', config.lvrRate);
                GM_setValue('sensitivity', config.sensitivity);

                configDiv.classList.add('hidden');
                summaryDiv.classList.remove('hidden');

                calculateMetrics(currentPrice, currentRental, config, state, suburb, postcode, function(updatedMetrics) {
                    metrics = updatedMetrics;
                    if (config.sensitivity) {
                        let configLow = { ...config, suburbGrowthRate: metrics.suburbGrowthRate - 0.02 };
                        let configHigh = { ...config, suburbGrowthRate: metrics.suburbGrowthRate + 0.02 };
                        calculateMetrics(currentPrice, currentRental, configLow, state, suburb, postcode, function(metricsLow) {
                            calculateMetrics(currentPrice, currentRental, configHigh, state, suburb, postcode, function(metricsHigh) {
                                irr10Low = metricsLow.irr10;
                                irr10High = metricsHigh.irr10;
                                updateDisplay();
                            });
                        });
                    } else {
                        updateDisplay();
                    }
                });
            };

            detailsDiv.addEventListener('input', function(e) {
                if (e.target.id === 'priceInput') {
                    currentPrice = e.target.value;
                } else if (e.target.id === 'rentalInput') {
                    currentRental = e.target.value;
                }
                calculateMetrics(currentPrice, currentRental, config, state, suburb, postcode, function(updatedMetrics) {
                    metrics = updatedMetrics;
                    if (config.sensitivity) {
                        let configLow = { ...config, suburbGrowthRate: metrics.suburbGrowthRate - 0.02 };
                        let configHigh = { ...config, suburbGrowthRate: metrics.suburbGrowthRate + 0.02 };
                        calculateMetrics(currentPrice, currentRental, configLow, state, suburb, postcode, function(metricsLow) {
                            calculateMetrics(currentPrice, currentRental, configHigh, state, suburb, postcode, function(metricsHigh) {
                                irr10Low = metricsLow.irr10;
                                irr10High = metricsHigh.irr10;
                                updateDisplay();
                            });
                        });
                    } else {
                        updateDisplay();
                    }
                });
            });

            detailsDiv.addEventListener('change', function(e) {
                if (e.target.id === 'periodSelect') {
                    currentPeriod = e.target.value;
                    updateDisplay();
                }
            });

            infoDiv.appendChild(summaryDiv);
            infoDiv.appendChild(detailsDiv);
            infoDiv.appendChild(configDiv);

            // Append elements to the body
            if (document.body) {
                console.log('Appending bar and insights panel to the DOM');
                document.body.insertBefore(barDiv, document.body.firstChild);
                document.body.insertBefore(infoDiv, barDiv.nextSibling);
            } else {
                console.error('document.body is not available');
            }
        });
    }

    // Main execution
    console.log('Script started on: ', window.location.href);
    let address = getAddress();
    if (address) {
        getPID(address, function(pid, source) {
            if (pid && source) {
                let propertyUrl = constructPropertyUrl(pid, source);
                if (propertyUrl) {
                    setTimeout(() => {
                        fetchPropertyData(propertyUrl, function(price, rental) {
                            displayData(price, rental, address);
                        });
                    }, 5000);
                } else {
                    console.error('Failed to construct property URL');
                    displayData('Error: Unable to construct property URL', 'N/A', address);
                }
            } else {
                console.error('PID or source not found');
                displayData('Error: PID not found', 'N/A', address);
            }
        });
    } else {
        console.error('No address found, script aborted');
        displayData('Error: Address not found on page', 'N/A', null);
    }
})();