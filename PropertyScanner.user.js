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
                background-color: white;
                border-bottom: 1px solid #ddd;
                z-index: 9999;
                padding: 8px 12px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            #property-insights-panel {
                position: fixed;
                top: 40px;
                left: 0;
                width: 90%;
                max-width: 1200px;
                background-color: white;
                border-right: 1px solid #ddd;
                border-bottom: 1px solid #ddd;
                z-index: 9998;
                max-height: calc(100vh - 40px);
                overflow-y: auto;
                padding: 0;
                display: none;
                box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            
            .metrics-container {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                gap: 12px;
                width: 100%;
            }
            
            .metrics-row {
                display: none;
            }
            
            .metric {
                display: flex;
                align-items: center;
                white-space: nowrap;
                min-width: 100px;
            }
            
            .metric-label {
                font-size: 0.75rem;
                color: #555;
                margin-right: 4px;
            }
            
            .metric-value {
                font-size: 0.8rem;
                font-weight: 500;
                color: #333;
            }
            
            .metric-value input {
                font-size: 0.8rem;
                width: 70px;
            }
            
            .metric-subtext {
                font-size: 0.7rem;
                color: #777;
                margin-left: 3px;
            }
            
            #property-insights {
                padding: 0;
            }
            
            .insights-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                border-bottom: 1px solid #eee;
                background-color: #f8f8f8;
            }
            
            .insights-title {
                font-weight: 600;
                font-size: 0.95rem;
                color: #333;
                margin: 0;
            }
            
            .insights-section {
                padding: 10px 15px;
                border-bottom: 1px solid #eee;
                background-color: white;
            }
            
            .insights-section-title {
                font-weight: 600;
                font-size: 0.85rem;
                color: #444;
                margin: 0 0 8px 0;
            }
            
            .insights-row {
                display: flex;
                justify-content: space-between;
                padding: 3px 0;
                line-height: 1.4;
            }
            
            .insights-label {
                font-size: 0.8rem;
                color: #555;
            }
            
            .insights-value {
                font-size: 0.8rem;
                font-weight: 500;
                color: #333;
            }
            
            .tab-content {
                background-color: white;
                padding: 0;
            }
            
            .tab-nav {
                display: flex;
                background-color: #f8f8f8;
                border-bottom: 1px solid #eee;
            }
            
            .tab-button {
                padding: 8px 15px;
                background: none;
                border: none;
                border-bottom: 2px solid transparent;
                font-size: 0.85rem;
                color: #555;
                cursor: pointer;
            }
            
            .tab-button.active {
                border-bottom-color: #4285f4;
                color: #4285f4;
                font-weight: 500;
            }
            
            .data-source {
                font-size: 0.7rem;
                color: #888;
                font-style: italic;
                margin-top: 8px;
            }
            
            .links-container {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .external-link {
                display: inline-block;
                padding: 6px 10px;
                background-color: #f5f5f5;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 0.8rem;
                color: #4285f4;
                text-decoration: none;
                margin-top: 5px;
            }
            
            .external-link:hover {
                background-color: #e8e8e8;
            }
            
            .status-detected {
                color: #e53e3e;
                font-weight: 500;
            }
            
            .status-none {
                color: #38a169;
            }
            
            .positive {
                color: #10b981;
            }
            
            .negative {
                color: #ef4444;
            }
            
            .controls {
                display: flex;
                gap: 6px;
                margin-left: 10px;
            }
            
            #toggleButton, #cogButton {
                background-color: #f5f5f5;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 4px 10px;
                font-size: 0.8rem;
                cursor: pointer;
            }
            
            #toggleButton:hover, #cogButton:hover {
                background-color: #e8e8e8;
            }
            
            #collapseMetricsBtn {
                background-color: #4285f4;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 5px 10px;
                font-size: 0.75rem;
                cursor: pointer;
            }
            
            #collapseMetricsBtn:hover {
                background-color: #3367d6;
            }
            
            .btn-primary {
                background-color: #4285f4;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 5px 10px;
                font-size: 0.75rem;
                cursor: pointer;
            }
            
            .btn-primary:hover {
                background-color: #3367d6;
            }
            
            .btn-sm {
                font-size: 0.7rem;
                padding: 4px 8px;
            }
            
            /* Input styles */
            .property-input {
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 6px 8px;
                font-size: 0.8rem;
                width: 100%;
                margin-bottom: 8px;
            }
            
            .property-input:focus {
                outline: none;
                border-color: #4285f4;
                box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
            }
            
            .property-select {
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 6px 8px;
                font-size: 0.8rem;
                width: 100%;
                margin-bottom: 8px;
                background-color: white;
            }
            
            .property-label {
                display: block;
                font-size: 0.8rem;
                color: #555;
                margin-bottom: 4px;
            }
            
            .config-section {
                margin-bottom: 15px;
            }
            
            .config-title {
                font-size: 0.85rem;
                font-weight: 600;
                color: #444;
                margin-bottom: 8px;
                padding-bottom: 4px;
                border-bottom: 1px solid #eee;
            }
            
            .checkbox-wrapper {
                display: flex;
                align-items: center;
                margin-bottom: 6px;
            }
            
            .checkbox-label {
                font-size: 0.8rem;
                color: #555;
                margin-left: 6px;
            }
            
            /* Table styles */
            table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.8rem;
                margin: 10px 0;
            }
            
            table th, table td {
                text-align: left;
                padding: 5px 8px;
                border-bottom: 1px solid #eee;
            }
            
            table th {
                font-weight: 500;
                background-color: #f5f5f5;
            }
            
            /* Chart container */
            .chart-container {
                height: 150px;
                margin-top: 10px;
                margin-bottom: 5px;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                #property-insights-panel {
                    width: 100%;
                    left: 0;
                }
            }
            
            /* Sales history styles */
            .sales-history-container {
                border-left: 2px solid #e0e0e0;
                margin-left: 5px;
                padding-left: 10px;
            }
            
            .latest-sale {
                font-weight: 500;
            }
            
            .sale-agency {
                margin-top: -2px;
                opacity: 0.85;
            }
            
            .sale-item {
                position: relative;
            }
            
            .sale-item:before {
                content: '';
                position: absolute;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #4285f4;
                left: -15px;
                top: 7px;
            }
            
            .insights-description {
                font-size: 0.75rem;
                color: #666;
                margin: -2px 0 5px 0;
                padding-left: 15px;
            }
            
            .mt-2 {
                margin-top: 8px;
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);

    // Create loading indicator immediately
    let loadingBar = document.createElement('div');
    loadingBar.id = 'loading-bar';
    loadingBar.innerHTML = `<div style="display: flex; align-items: center;">
        <div class="spinner"></div>
        <span>Loading property insights...</span>
    </div>`;
    
    // Function to add loading bar immediately
    function addLoadingBar() {
        // Create and add loading bar to indicate the script is running
        loadingBar = document.createElement('div');
        loadingBar.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 3px; background-color: #007bff; z-index: 10000; animation: progress 2s ease-in-out infinite;';
        
        // Add keyframes for loading animation
        let styleSheet = document.createElement('style');
        styleSheet.id = 'property-insights-loading-styles';
        styleSheet.innerHTML = `
            @keyframes progress {
                0% { width: 0%; left: 0; }
                50% { width: 100%; left: 0; }
                100% { width: 0%; left: 100%; }
            }
        `;
        document.head.appendChild(styleSheet);
        document.body.style.paddingTop = '3px';
        document.body.appendChild(loadingBar);
    }
    
    // More precise layout adjustment
    function adjustPageLayout() {
        // Find main navigation or header element to adjust
        const nav = document.querySelector('nav, header, .header, [class*="navigation"], [class*="nav-"]');
        if (nav) {
            // Add margin to the navigation instead of body padding
            const currentMargin = parseInt(window.getComputedStyle(nav).marginTop || '0');
            nav.style.marginTop = (currentMargin + 32) + 'px';
        } else {
            // Fallback to body padding but with a more precise calculation
            const firstElement = document.body.firstElementChild;
            if (firstElement && firstElement !== loadingBar && firstElement.id !== 'property-insights-bar') {
                const currentMargin = parseInt(window.getComputedStyle(firstElement).marginTop || '0');
                firstElement.style.marginTop = (currentMargin + 32) + 'px';
            }
        }
    }
    
    // Call immediately
    addLoadingBar();

    // Improved performance: Use cached DOM queries and prevent layout thrashing
    let cache = {};
    
    // Performance optimization: Debounce expensive operations
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Performance optimization: Use requestAnimationFrame for smooth UI updates
    function rafThrottle(callback) {
        let queued = false;
        return function() {
            if (!queued) {
                queued = true;
                requestAnimationFrame(() => {
                    callback();
                    queued = false;
                });
            }
        };
    }
    
    // Function to extract address from realestate.com.au page - Optimized
    function getAddress() {
        console.log('Attempting to extract address...');
        if (cache.address) return cache.address;
        
        let selectors = 'h1, [data-testid="listing-details__listing-summary"], .listing-details__address, .address';
        let addressElement = document.querySelector(selectors);
        let address = addressElement ? addressElement.textContent.trim() : null;
        
        if (address) {
            console.log('Address found: ', address);
            cache.address = address; // Cache for future use
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
        if (!pid) {
            console.error('Cannot construct URL: PID missing');
            return null;
        }
        
        if (typeof source === 'object' && source !== null) {
            // Original implementation for when source is an object with properties
            let state = source.state.toLowerCase();
            let suburb = source.suburb.toLowerCase().replace(/ /g, '-');
            let postcode = source.postcode;
            let street = source.street.toLowerCase().replace(/ /g, '-');
            let streetType = source.streetType.toLowerCase();
            let streetNumber = source.streetNumber;
            
            // Fix: Format the street number properly with hyphens instead of slashes
            if (streetNumber && streetNumber.includes('/')) {
                streetNumber = streetNumber.replace('/', '-');
            }
            
            let url = `https://www.property.com.au/${state}/${suburb}-${postcode}/${street}-${streetType}/${streetNumber}-pid-${pid}/`;
            console.log('Constructed property URL: ', url);
            return url;
        } else {
            // If source is not an object, assume it's a string PID format directly from property.com.au
            // Extract the PID number without the "PID-" prefix if present
            const pidNumber = pid.toString().replace(/^(?:pid-)?/i, '');
            // Use a simpler URL format that will redirect properly on property.com.au
            const url = `https://www.property.com.au/property/pid-${pidNumber}`;
            console.log('Constructed simplified property URL: ', url);
            return url;
        }
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

                    // Extract sold history
                    let soldHistory = extractSoldHistory(doc);
                    console.log('Sold history extracted: ', soldHistory);
                    
                    // Extract planning information
                    let planningInfo = extractPlanningInfo(doc);
                    console.log('Planning information extracted: ', planningInfo);

                    console.log('Price extracted: ', price);
                    console.log('Rental estimate extracted: ', rental);
                    callback(price, rental, soldHistory, planningInfo);
                } else {
                    console.error('Property.com.au request failed with status: ', response.status);
                    console.log('Falling back to realestate.com.au data...');
                    let fallbackData = getFallbackData();
                    callback(fallbackData.price, fallbackData.rental, [], { overlays: [], zone: 'Unknown' });
                }
            },
            onerror: function(err) {
                console.error('Property.com.au request error: ', err);
                console.log('Falling back to realestate.com.au data...');
                let fallbackData = getFallbackData();
                callback(fallbackData.price, fallbackData.rental, [], { overlays: [], zone: 'Unknown' });
            },
            ontimeout: function() {
                console.error('Property.com.au request timed out');
                console.log('Falling back to realestate.com.au data...');
                let fallbackData = getFallbackData();
                callback(fallbackData.price, fallbackData.rental, [], { overlays: [], zone: 'Unknown' });
            },
            timeout: 15000
        });
    }

    // Function to extract sold history from property.com.au
    function extractSoldHistory(doc) {
        const soldEvents = [];
        
        try {
            // Find all sold events in the timeline
            const soldElements = doc.querySelectorAll('.PropertyTimelineEventGroup__TimelineEventWrapper-sc-1vfrd4v-2');
            
            for (const element of soldElements) {
                // Check if this is a "Sold" event
                const badgeElement = element.querySelector('.Badge-sc-2q2m5z-0');
                if (!badgeElement || badgeElement.textContent.trim() !== 'Sold') continue;
                
                // Extract price
                const priceElement = element.querySelector('.PropertyTimelineEvent__EventTitle-sc-w0fuls-2');
                if (!priceElement) continue;
                const price = priceElement.textContent.trim();
                
                // Extract date
                const detailsElement = element.querySelector('.PropertyTimelineEvent__EventDetails-sc-w0fuls-4');
                if (!detailsElement) continue;
                const detailsText = detailsElement.textContent.trim();
                
                // Parse date from details text like "Sold 23 May 2020" or "13 Jul 2020 by Agency"
                let dateMatch = detailsText.match(/(?:Sold\s+)?(\d{1,2}\s+[A-Za-z]+\s+\d{4})/);
                const date = dateMatch ? dateMatch[1] : 'Unknown date';
                
                // Get agency info if available
                const agencyMatch = detailsText.match(/by\s+(.+)$/);
                const agency = agencyMatch ? agencyMatch[1] : '';
                
                soldEvents.push({
                    price,
                    date,
                    agency
                });
            }
            
            // Sort by date (newest first) and return the two most recent sales
            return soldEvents.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA;
            }).slice(0, 2);
            
        } catch (error) {
            console.error('Error extracting sold history:', error);
            return [];
        }
    }

    // Function to extract planning overlays and zones from property.com.au
    function extractPlanningInfo(doc) {
        const planningInfo = {
            overlays: [],
            zone: 'Unknown'
        };
        
        try {
            // Extract planning overlays
            const overlayTiles = doc.querySelectorAll('.OverlayTiles__CardWrapper-sc-1km53tf-1');
            
            if (overlayTiles && overlayTiles.length > 0) {
                for (const tile of overlayTiles) {
                    // Get the overlay title
                    const titleElement = tile.querySelector('.OverlayTiles__TileTitle-sc-1km53tf-4');
                    if (!titleElement) continue;
                    
                    // Get the badge status (detected/not detected)
                    const badgeElement = tile.querySelector('.Badge-sc-2q2m5z-0');
                    if (!badgeElement) continue;
                    
                    // Get the description
                    const descriptionElement = tile.querySelector('.OverlayTiles__Description-sc-1km53tf-7');
                    const description = descriptionElement ? descriptionElement.textContent.trim() : '';
                    
                    planningInfo.overlays.push({
                        type: titleElement.textContent.trim(),
                        status: badgeElement.textContent.trim(),
                        description: description
                    });
                }
            }
            
            // Extract zoning information if available
            const zoneElements = doc.querySelectorAll('.ZoningCode__ZoningCodeWrapper-sc-4jri88-0, [data-testid*="zoning"]');
            if (zoneElements && zoneElements.length > 0) {
                for (const element of zoneElements) {
                    const text = element.textContent.trim();
                    if (text.includes('Zone') || text.match(/^[A-Z][0-9]/) || text.match(/^[A-Z]{2,3}$/)) {
                        planningInfo.zone = text;
                        break;
                    }
                }
            }
            
            console.log('Planning info extracted:', planningInfo);
            return planningInfo;
            
        } catch (error) {
            console.error('Error extracting planning information:', error);
            return planningInfo;
        }
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
            strata: 5000,
            yearByYearDetails: [], // Added for year-by-year analysis
            loanAmount: 0,
            lvrPercent: 0
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

            let suburbGrowth = `${(suburbGrowthRate * 100).toFixed(2)}%`;

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
            let yearByYearDetails = [];
            
            for (let year = 1; year <= 15; year++) {
                let futurePropertyValue = Math.round(price * Math.pow(1 + suburbGrowthRate, year));
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
                
                // Calculate LVR for each year
                let futureLoanAmount = loanAmount; // Assuming interest-only loan
                let futureLVR = ((futureLoanAmount / futurePropertyValue) * 100).toFixed(2);
                let futureEquity = futurePropertyValue - futureLoanAmount;
                
                if (year <= 10) {
                    annualProfitLoss.push(Math.round(futureAfterTaxCashFlow));
                    cumulative += futureAfterTaxCashFlow;
                    cumulativeProfitLoss.push(Math.round(cumulative));
                }
                
                // Store detailed year-by-year metrics
                yearByYearDetails.push({
                    year,
                    propertyValue: futurePropertyValue,
                    loanAmount: futureLoanAmount,
                    lvrValue: futureLVR,  // Changed from 'lvr' to 'lvrValue' to avoid reserved word
                    equity: futureEquity,
                    rentAmount: Math.round(futureAnnualRent),  // Changed from 'rent' to 'rentAmount'
                    preTaxCashFlow: Math.round(futurePreTaxCashFlow),
                    afterTaxCashFlow: Math.round(futureAfterTaxCashFlow),
                    cumulativeCashFlow: year === 1 ? Math.round(futureAfterTaxCashFlow) : Math.round(yearByYearDetails[year-2].cumulativeCashFlow + futureAfterTaxCashFlow)
                });
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
                yearByYearDetails: yearByYearDetails,
                suburbGrowthRate: suburbGrowthRate,
                interestRate: interestRate,
                managementFee: managementFee,
                strata: strata,
                loanAmount: loanAmount,
                lvrPercent: parseFloat(lvr)
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

    // Function to fetch suburb demographic data
    function fetchSuburbDemographics(suburb, state, postcode, callback) {
        const url = `https://www.domain.com.au/suburb-profile/${suburb}-${state}-${postcode}`;
        console.log(`Fetching suburb data from: ${url}`);
        
        GM.xmlHttpRequest({
            method: 'GET',
            url: url,
            onload: function(response) {
                console.log(`Domain.com.au response status: ${response.status}`);
                if (response.status === 200) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    
                    let data = {
                        medianPrices: {},
                        avgDaysOnMarket: {},
                        soldThisYear: {},
                        source: 'domain.com.au'
                    };
                    
                    // Extract Market Trends table data
                    const marketRows = doc.querySelectorAll('tbody[data-testid="insight"] tr');
                    console.log(`Found ${marketRows.length} market trend rows`);
                    
                    marketRows.forEach(row => {
                        // Extract bedroom count and property type
                        const bedroomCell = row.querySelector('td:first-child');
                        const typeCell = row.querySelector('td:nth-child(2)');
                        
                        if (bedroomCell && typeCell) {
                            const bedroomText = bedroomCell.textContent.trim();
                            const bedrooms = bedroomText.match(/\d+/)[0];
                            const propertyType = typeCell.textContent.trim().toLowerCase();
                            const key = `${bedrooms}bed-${propertyType}`;
                            
                            // Extract median price
                            const priceCell = row.querySelector('td:nth-child(3)');
                            if (priceCell) {
                                data.medianPrices[key] = priceCell.textContent.trim();
                            }
                            
                            // Extract days on market
                            const daysCell = row.querySelector('td:nth-child(4)');
                            if (daysCell) {
                                data.avgDaysOnMarket[key] = daysCell.textContent.trim();
                            }
                            
                            // Extract sold count
                            const soldCell = row.querySelector('td:nth-child(6)');
                            if (soldCell) {
                                data.soldThisYear[key] = soldCell.textContent.trim();
                            }
                        }
                    });
                    
                    // Try to find population data if available anywhere on the page
                    const pageText = doc.body.textContent;
                    const popMatch = pageText.match(/population of ([\d,]+)/i);
                    if (popMatch) data.population = popMatch[1];
                    
                    const ageMatch = pageText.match(/median age (?:is|of) (\d+)/i);
                    if (ageMatch) data.medianAge = ageMatch[1];
                    
                    console.log("Extracted suburb data:", data);
                    callback(data);
                } else {
                    console.error(`Failed to load domain.com.au data: ${response.status}`);
                    callback(null);
                }
            },
            onerror: function(err) {
                console.error('Error fetching suburb data:', err);
                callback(null);
            }
        });
    }

    // Function to display data with modern UI
    function displayData(originalPrice, originalRental, address) {
        console.log('Displaying data - Price: ', originalPrice, 'Rental: ', originalRental);
        
        // Store current price and rental values for later use
        const currentPrice = originalPrice;
        const currentRental = originalRental;
        
        // Define default config
        let config = {
            lvrRate: GM_getValue('lvrRate', 0.8),
            interestRate: GM_getValue('interestRate', 0.0622),
            constructionCost: GM_getValue('constructionCost', parseFloat(currentPrice.replace(/[^\d.-]/g, '')) * 0.4),
            fittingsValue: GM_getValue('fittingsValue', 10000),
            suburbGrowthRate: 0.1437, // Will be updated by API
            rentalGrowthRate: GM_getValue('rentalGrowthRate', 0.03),
            managementFee: GM_getValue('managementFee', 0.08),
            vacancyRate: GM_getValue('vacancyRate', 0.05),
            incomeA: GM_getValue('incomeA', 215000),
            incomeB: GM_getValue('incomeB', 110000),
            allocationA: GM_getValue('allocationA', 0.5),
            allocationB: GM_getValue('allocationB', 0.5)
        };
        
        // Placeholder for metrics data
        let metrics = {};
        
        // Remove loading bar
        if (loadingBar && loadingBar.parentNode) {
            loadingBar.parentNode.removeChild(loadingBar);
        }
        
        let { suburb, state, postcode } = parseAddress(address);

        // Get sold history from global variable if available
        const soldHistory = window.propertySoldHistory || [];
        console.log('Sold history for display:', soldHistory);
        
        // Get planning info from global variable if available
        const planningInfo = window.propertyPlanningInfo || { overlays: [], zone: 'Unknown' };
        console.log('Planning info for display:', planningInfo);
        
        // Get source URL if available
        const propertySourceUrl = window.propertySourceUrl || '';

        console.log('Creating direct property scanner overlay...');
        
        // REMOVE all existing property scanner elements to avoid duplicates
        const existingElements = document.querySelectorAll('[id^="property-insights"], #ps-simple-bar, #ps-direct-top-bar');
        existingElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        // Create a GUARANTEED-VISIBLE top bar with direct styling
        let directTopBar = document.createElement('div');
        directTopBar.id = 'ps-direct-top-bar';
        directTopBar.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            background-color: white !important;
            border-bottom: 1px solid #ddd !important;
            z-index: 2147483647 !important;
            padding: 8px 12px !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
            font-size: 14px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
        `;
        
        let metricsHTML = `
            <div style="display: flex; gap: 20px; align-items: center; overflow-x: auto; white-space: nowrap; padding-right: 10px; flex: 1;">
                <div style="display: flex; align-items: center; padding: 4px 0;">
                    <span style="font-size: 0.8rem; color: #555; margin-right: 4px; font-weight: 500;">Price:</span>
                    <span style="font-size: 0.85rem; font-weight: 600; color: #333;">${currentPrice}</span>
                </div>
                <div style="display: flex; align-items: center; padding: 4px 0;">
                    <span style="font-size: 0.8rem; color: #555; margin-right: 4px; font-weight: 500;">Rent:</span>
                    <span style="font-size: 0.85rem; font-weight: 600; color: #333;">${currentRental}</span>
                </div>
                <div style="display: flex; align-items: center; padding: 4px 0;">
                    <span style="font-size: 0.8rem; color: #555; margin-right: 4px; font-weight: 500;">Yield:</span>
                    <span id="yield-metric" style="font-size: 0.85rem; font-weight: 600; color: #333;">Calculating...</span>
                </div>
                <div style="display: flex; align-items: center; padding: 4px 0;">
                    <span style="font-size: 0.8rem; color: #555; margin-right: 4px; font-weight: 500;">Annual CF:</span>
                    <span id="annual-cashflow-metric" style="font-size: 0.85rem; font-weight: 600; color: #333;">Calculating...</span>
                </div>
                <div style="display: flex; align-items: center; padding: 4px 0;">
                    <span style="font-size: 0.8rem; color: #555; margin-right: 4px; font-weight: 500;">5Y IRR:</span>
                    <span id="irr5-metric" style="font-size: 0.85rem; font-weight: 600; color: #333;">Calculating...</span>
                </div>
                <div style="display: flex; align-items: center; padding: 4px 0;">
                    <span style="font-size: 0.8rem; color: #555; margin-right: 4px; font-weight: 500;">Growth:</span>
                    <span id="growth-metric" style="font-size: 0.85rem; font-weight: 600; color: #333;">Calculating...</span>
                </div>
                <div id="planning-alerts" style="display: none; align-items: center; padding: 4px 0;">
                    <span style="font-size: 0.8rem; color: #555; margin-right: 4px; font-weight: 500;">Alert:</span>
                    <span id="planning-alert-metric" style="font-size: 0.85rem; font-weight: 600; color: #ff4444;"></span>
                </div>
            </div>
            <div style="display: flex; gap: 8px; margin-left: 5px; flex-shrink: 0;">
                <button id="ps-toggle-button" style="background-color: #4285f4; color: white; border: none; border-radius: 4px; padding: 5px 12px; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: background-color 0.2s;">Details</button>
                <button id="ps-cog-button" style="background-color: #f1f1f1; border: 1px solid #ddd; border-radius: 4px; padding: 5px 8px; font-size: 0.8rem; cursor: pointer; transition: background-color 0.2s;">⚙️</button>
            </div>
        `;
        
        directTopBar.innerHTML = metricsHTML;
        
        // Add global styles for the tabs
        // Use a different variable name to avoid redeclaration
        let tabStyleElement = document.createElement('style');
        tabStyleElement.id = 'property-insights-tab-styles';
        tabStyleElement.innerHTML = `
            .insights-header {
                padding: 15px;
                border-bottom: 1px solid #eee;
                background-color: #f9f9f9;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .insights-title {
                margin: 0;
                font-size: 1.2rem;
                font-weight: 600;
                color: #333;
            }
            
            .tab-nav {
                display: flex;
                gap: 5px;
            }
            
            .tab-button {
                padding: 6px 12px;
                background-color: #f1f1f1;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: background-color 0.2s;
                color: #555;
                font-weight: 500;
            }
            
            .tab-button:hover {
                background-color: #e9e9e9;
            }
            
            .tab-button.active {
                background-color: #4285f4;
                color: white;
                border-color: #4285f4;
            }
            
            .insights-section {
                margin: 15px;
                padding: 15px;
                background-color: #fff;
                border: 1px solid #eee;
                border-radius: 4px;
            }
            
            .insights-section-title {
                margin: 0 0 10px 0;
                font-size: 1rem;
                font-weight: 600;
                color: #333;
            }
            
            .insights-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 0;
                border-bottom: 1px solid #f5f5f5;
            }
            
            .insights-label {
                font-size: 0.85rem;
                color: #555;
            }
            
            .insights-value {
                font-size: 0.85rem;
                font-weight: 600;
                color: #333;
            }
            
            .positive {
                color: #10b981;
            }
            
            .negative {
                color: #ef4444;
            }
            
            .tab-content {
                display: block;
            }
            
            .tab-content.hidden {
                display: none;
            }
        `;
        document.head.appendChild(tabStyleElement);
        
        // Create panel container with direct styling
        let directPanel = document.createElement('div');
        directPanel.id = 'ps-direct-panel';
        directPanel.style.cssText = `
            position: fixed !important;
            top: 36px !important;
            left: 10% !important;
            width: 80% !important;
            max-width: 800px !important;
            background-color: white !important;
            border: 1px solid #ddd !important;
            border-radius: 8px !important;
            z-index: 2147483640 !important;
            max-height: 80vh !important;
            overflow-y: auto !important;
            padding: 0 !important;
            display: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
        `;
        
        // Create a backdrop overlay to dim the rest of the page when panel is open
        let backdropOverlay = document.createElement('div');
        backdropOverlay.id = 'ps-backdrop-overlay';
        backdropOverlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(0, 0, 0, 0.4) !important;
            z-index: 2147483639 !important;
            display: none;
        `;
        
        // Create the content divs
        let summaryDiv = document.createElement('div');
        summaryDiv.id = 'property-insights-summary';
        summaryDiv.className = 'tab-content';
        summaryDiv.style.cssText = 'display: block !important;';
        
        let detailsDiv = document.createElement('div');
        detailsDiv.id = 'property-insights-details';
        detailsDiv.className = 'tab-content';
        detailsDiv.style.cssText = 'display: none !important;';
        
        let configDiv = document.createElement('div');
        configDiv.id = 'property-insights-config';
        configDiv.className = 'tab-content';
        configDiv.style.cssText = 'display: none !important;';
        
        // Create the main bar and info container
        let barDiv = document.createElement('div');
        barDiv.id = 'property-insights-bar';
        barDiv.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            background-color: white !important;
            z-index: 2147483647 !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
        `;
        
        let infoDiv = document.createElement('div');
        infoDiv.id = 'property-insights-panel';
        infoDiv.style.cssText = `
            position: fixed !important;
            top: 40px !important;
            left: 0 !important;
            width: 90% !important;
            max-width: 1200px !important;
            background-color: white !important;
            border: 1px solid #ddd !important;
            z-index: 2147483646 !important;
            max-height: calc(100vh - 40px) !important;
            overflow-y: auto !important;
            padding: 0 !important;
            display: none !important;
            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1) !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
        `;
        
        // Append elements to direct panel (this is what the toggle button shows/hides)
        directPanel.appendChild(summaryDiv);
        directPanel.appendChild(detailsDiv);
        directPanel.appendChild(configDiv);
        
        // Inject direct panel elements into the document body
        document.body.appendChild(directTopBar);
        document.body.appendChild(directPanel);
        document.body.appendChild(backdropOverlay);
        
        console.log('Direct top bar added to DOM', directTopBar);
        
        // First, push down fixed headers on the page to make room for our bar
        document.querySelectorAll('header, .header, [class*="navbar"], [class*="header"], [class*="nav-"]').forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.position === 'fixed' && computedStyle.top === '0px') {
                element.style.top = '36px';
            }
        });
        
        // Add event listeners for the buttons
        setTimeout(() => {
            const toggleButton = document.getElementById('ps-toggle-button');
            const cogButton = document.getElementById('ps-cog-button');
            const panel = document.getElementById('ps-direct-panel');
            const backdrop = document.getElementById('ps-backdrop-overlay');
            
            console.log('Toggle button found:', toggleButton);
            console.log('Panel found:', panel);
            console.log('Backdrop found:', backdrop);
            
            // Function to open the panel
            const openPanel = () => {
                // Force the display property using setAttribute to override any !important flags
                panel.setAttribute('style', panel.getAttribute('style').replace('display: none', 'display: block'));
                backdrop.style.display = 'block';
                toggleButton.textContent = 'Hide';
                
                // Make sure summary is shown when panel is opened
                if (summaryDiv) {
                    summaryDiv.style.display = 'block';
                    if (detailsDiv) detailsDiv.style.display = 'none';
                    if (configDiv) configDiv.style.display = 'none';
                }
            };
            
            // Function to close the panel
            const closePanel = () => {
                panel.style.display = 'none';
                backdrop.style.display = 'none';
                toggleButton.textContent = 'Details';
            };
            
            // Add click listener to backdrop to close panel when clicking outside
            if (backdrop) {
                backdrop.addEventListener('click', function(e) {
                    if (e.target === backdrop) {
                        closePanel();
                    }
                });
            }
            
            if (toggleButton && panel) {
                toggleButton.addEventListener('click', function() {
                    console.log('Toggle button clicked, panel display:', panel.style.display);
                    
                    if (panel.style.display === 'block') {
                        closePanel();
                    } else {
                        openPanel();
                    }
                });
            }
            
            if (cogButton && panel) {
                cogButton.addEventListener('click', function() {
                    // Show panel if it's hidden
                    if (panel.style.display !== 'block') {
                        openPanel();
                    }
                    
                    // Toggle between config and other views
                    if (configDiv && configDiv.style.display !== 'block') {
                        if (summaryDiv) summaryDiv.style.display = 'none';
                        if (detailsDiv) detailsDiv.style.display = 'none';
                        configDiv.style.display = 'block';
                    } else if (summaryDiv) {
                        if (configDiv) configDiv.style.display = 'none';
                        if (detailsDiv) detailsDiv.style.display = 'none';
                        summaryDiv.style.display = 'block';
                    }
                });
            }
        }, 100);
        
        // Function to update the display with calculated metrics
        function updateDisplay() {
            console.log("Updating display with metrics:", metrics);
            
            // Update the summary div with investment metrics
            summaryDiv.innerHTML = `
                <div class="insights-header">
                    <h3 class="insights-title">Property Investment Analysis</h3>
                    <div class="tab-nav">
                        <button class="tab-button active" id="summaryTabBtn">Summary</button>
                        <button class="tab-button" id="detailsTabBtn">Details</button>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; padding: 15px;">
                    <!-- Column 1: Investment Snapshot -->
                    <div class="insights-section" style="margin: 0;">
                        <h4 class="insights-section-title">Investment Snapshot</h4>
                        <div class="insights-row">
                            <span class="insights-label">Purchase Price:</span>
                            <span class="insights-value">${currentPrice}</span>
                        </div>
                        <div class="insights-row">
                            <span class="insights-label">Weekly Rental:</span>
                            <span class="insights-value">${currentRental}</span>
                        </div>
                        <div class="insights-row">
                            <span class="insights-label">Rental Yield:</span>
                            <span class="insights-value ${parseFloat(metrics.rentalYield) >= 5 ? 'positive' : parseFloat(metrics.rentalYield) < 3.5 ? 'negative' : ''}">${metrics.rentalYield || 'N/A'}</span>
                        </div>
                        <div class="insights-row">
                            <span class="insights-label">Weekly Cash Flow:</span>
                            <span class="insights-value ${parseFloat(metrics.weeklyCashFlow) > 0 ? 'positive' : parseFloat(metrics.weeklyCashFlow) < 0 ? 'negative' : ''}">$${parseFloat(metrics.weeklyCashFlow).toFixed(2) || 'N/A'}</span>
                        </div>
                        <div class="insights-row">
                            <span class="insights-label">Annual Cash Flow:</span>
                            <span class="insights-value ${parseFloat(metrics.annualCashFlow) > 0 ? 'positive' : parseFloat(metrics.annualCashFlow) < 0 ? 'negative' : ''}">$${parseFloat(metrics.annualCashFlow).toFixed(2) || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <!-- Column 2: Property Potential -->
                    <div class="insights-section" style="margin: 0;">
                        <h4 class="insights-section-title">Property Potential</h4>
                        <div class="insights-row">
                            <span class="insights-label">Suburb Growth:</span>
                            <span class="insights-value">${metrics.suburbGrowth || 'N/A'}</span>
                        </div>
                        <div class="insights-row">
                            <span class="insights-label">Break-even Year:</span>
                            <span class="insights-value">${metrics.breakEvenYear || 'N/A'}</span>
                        </div>
                        <div class="insights-row">
                            <span class="insights-label">5-Year IRR:</span>
                            <span class="insights-value ${parseFloat(metrics.irr5) > 15 ? 'positive' : parseFloat(metrics.irr5) < 10 ? 'negative' : ''}">${metrics.irr5 || 'N/A'}</span>
                        </div>
                        <div class="insights-row">
                            <span class="insights-label">10-Year IRR:</span>
                            <span class="insights-value ${parseFloat(metrics.irr10) > 15 ? 'positive' : parseFloat(metrics.irr10) < 10 ? 'negative' : ''}">${metrics.irr10 || 'N/A'}</span>
                        </div>
                        <div class="insights-row">
                            <span class="insights-label">Cash-on-Cash Return:</span>
                            <span class="insights-value">${metrics.cashOnCashAfterTax || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <!-- Column 3: Future Projections -->
                    <div class="insights-section" style="margin: 0;">
                        <h4 class="insights-section-title">Future Projections</h4>
                        <div class="insights-row">
                            <span class="insights-label">5 Year Value:</span>
                            <span class="insights-value">${metrics.futurePrice5 || 'N/A'}</span>
                        </div>
                        <div class="insights-row">
                            <span class="insights-label">5 Year Rent:</span>
                            <span class="insights-value">${metrics.futureRent5 || 'N/A'}</span>
                        </div>
                        <div class="insights-row">
                            <span class="insights-label">10 Year Value:</span>
                            <span class="insights-value">${metrics.futurePrice10 || 'N/A'}</span>
                        </div>
                        <div class="insights-row">
                            <span class="insights-label">10 Year Rent:</span>
                            <span class="insights-value">${metrics.futureRent10 || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Bottom sections in 3-column layout -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; padding: 15px;">
                    <!-- Column 1: Sales History -->
                    <div class="insights-section" style="margin: 0;">
                        <h4 class="insights-section-title">Sales History</h4>
                        <div class="sales-history-container">
                            ${soldHistory && soldHistory.length > 0 ? 
                                soldHistory.map((sale, index) => `
                                    <div class="sale-item ${index === 0 ? 'latest-sale' : ''}">
                                        <div>${sale.price}</div>
                                        <div class="sale-agency">${sale.date}${sale.agency ? ` - ${sale.agency}` : ''}</div>
                                    </div>
                                `).join('') : 
                                '<div class="no-data">No sales history available</div>'
                            }
                        </div>
                    </div>
                    
                    <!-- Column 2: Planning Information -->
                    <div class="insights-section" style="margin: 0;">
                        <h4 class="insights-section-title">Planning Information</h4>
                        <div class="insights-row">
                            <span class="insights-label">Zone:</span>
                            <span class="insights-value">${planningInfo.zone || 'Unknown'}</span>
                        </div>
                        ${planningInfo && planningInfo.overlays && planningInfo.overlays.length > 0 ? `
                            <p class="insights-description">The following planning overlays apply:</p>
                            ${planningInfo.overlays.map(overlay => `
                                <div class="insights-row mt-2">
                                    <span class="insights-label">${overlay.type}:</span>
                                    <span class="insights-value ${overlay.status === 'Detected' ? 'status-detected' : 'status-none'}">${overlay.status}</span>
                                </div>
                            `).join('')}
                        ` : '<p class="insights-description">No planning overlays detected</p>'}
                    </div>
                    
                    <!-- Column 3: External Links -->
                    <div class="insights-section" style="margin: 0;">
                        <h4 class="insights-section-title">External Links</h4>
                        <div class="links-container" style="display: flex; flex-direction: column; gap: 10px;">
                            ${propertySourceUrl ? `<a href="${propertySourceUrl}" target="_blank" class="external-link" style="padding: 8px 12px; background-color: #f5f5f5; border-radius: 4px; text-decoration: none; color: #4285f4; display: block; text-align: center;">View on Property.com.au</a>` : ''}
                            <a href="https://www.domain.com.au/suburb-profile/${suburb}-${state}-${postcode}" target="_blank" class="external-link" style="padding: 8px 12px; background-color: #f5f5f5; border-radius: 4px; text-decoration: none; color: #4285f4; display: block; text-align: center;">View Suburb Profile on Domain</a>
                        </div>
                    </div>
                </div>
            `;
            
            // Update the details div with more advanced metrics
            detailsDiv.innerHTML = `
                <div class="insights-header">
                    <h3 class="insights-title">Detailed Analysis</h3>
                    <div class="tab-nav">
                        <button class="tab-button" id="summaryTabBtn2">Summary</button>
                        <button class="tab-button active" id="detailsTabBtn2">Details</button>
                    </div>
                </div>
                
                <div class="insights-section">
                    <h4 class="insights-section-title">Year-by-Year Projections</h4>
                    <div style="margin-bottom: 10px; overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                            <thead>
                                <tr>
                                    <th style="text-align: left; padding: 6px 8px; border-bottom: 1px solid #eee; background-color: #f5f5f5;">Year</th>
                                    <th style="text-align: right; padding: 6px 8px; border-bottom: 1px solid #eee; background-color: #f5f5f5;">Property Value</th>
                                    <th style="text-align: right; padding: 6px 8px; border-bottom: 1px solid #eee; background-color: #f5f5f5;">LVR</th>
                                    <th style="text-align: right; padding: 6px 8px; border-bottom: 1px solid #eee; background-color: #f5f5f5;">Equity</th>
                                    <th style="text-align: right; padding: 6px 8px; border-bottom: 1px solid #eee; background-color: #f5f5f5;">Annual Rent</th>
                                    <th style="text-align: right; padding: 6px 8px; border-bottom: 1px solid #eee; background-color: #f5f5f5;">Cash Flow</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${metrics.yearByYearDetails ? metrics.yearByYearDetails.slice(0, 10).map(year => `
                                    <tr>
                                        <td style="text-align: left; padding: 6px 8px; border-bottom: 1px solid #eee;">${year.year}</td>
                                        <td style="text-align: right; padding: 6px 8px; border-bottom: 1px solid #eee;">$${year.propertyValue.toLocaleString()}</td>
                                        <td style="text-align: right; padding: 6px 8px; border-bottom: 1px solid #eee;">${year.lvrValue}%</td>
                                        <td style="text-align: right; padding: 6px 8px; border-bottom: 1px solid #eee;">$${year.equity.toLocaleString()}</td>
                                        <td style="text-align: right; padding: 6px 8px; border-bottom: 1px solid #eee;">$${year.rentAmount.toLocaleString()}</td>
                                        <td style="text-align: right; padding: 6px 8px; border-bottom: 1px solid #eee; ${year.afterTaxCashFlow >= 0 ? 'color: #10b981;' : 'color: #ef4444;'}">$${year.afterTaxCashFlow.toLocaleString()}</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="6" style="text-align: center; padding: 10px;">No year-by-year data available</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="insights-section">
                    <h4 class="insights-section-title">Financial Details</h4>
                    <div class="insights-row">
                        <span class="insights-label">Loan Amount:</span>
                        <span class="insights-value">$${Math.round(metrics.loanAmount).toLocaleString() || 'N/A'}</span>
                    </div>
                    <div class="insights-row">
                        <span class="insights-label">LVR:</span>
                        <span class="insights-value">${metrics.lvr || 'N/A'}</span>
                    </div>
                    <div class="insights-row">
                        <span class="insights-label">Annual Interest:</span>
                        <span class="insights-value">$${Math.round(metrics.loanAmount * metrics.interestRate).toLocaleString() || 'N/A'}</span>
                    </div>
                    <div class="insights-row">
                        <span class="insights-label">Property Management:</span>
                        <span class="insights-value">$${Math.round(parseFloat(currentRental) * 52 * metrics.managementFee).toLocaleString() || 'N/A'}</span>
                    </div>
                    <div class="insights-row">
                        <span class="insights-label">Strata Fees:</span>
                        <span class="insights-value">$${Math.round(metrics.strata).toLocaleString() || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="insights-section">
                    <h4 class="insights-section-title">Tax Benefits</h4>
                    <div class="insights-row">
                        <span class="insights-label">Tax Savings (Partner A):</span>
                        <span class="insights-value ${parseFloat(metrics.taxSavingsA) > 0 ? 'positive' : ''}">$${parseFloat(metrics.taxSavingsA).toFixed(2) || 'N/A'}</span>
                    </div>
                    <div class="insights-row">
                        <span class="insights-label">Tax Savings (Partner B):</span>
                        <span class="insights-value ${parseFloat(metrics.taxSavingsB) > 0 ? 'positive' : ''}">$${parseFloat(metrics.taxSavingsB).toFixed(2) || 'N/A'}</span>
                    </div>
                    <div class="insights-row">
                        <span class="insights-label">Building Depreciation:</span>
                        <span class="insights-value">${metrics.depreciationBuildings || 'N/A'}</span>
                    </div>
                    <div class="insights-row">
                        <span class="insights-label">Fittings Depreciation:</span>
                        <span class="insights-value">${metrics.depreciationFittings || 'N/A'}</span>
                    </div>
                </div>
            `;
            
            // Debug content
            console.log("Summary content length:", summaryDiv.innerHTML.length);
            console.log("Details content length:", detailsDiv.innerHTML.length);
            console.log("Details content populated:", detailsDiv.innerHTML.includes("Year-by-Year Projections"));
            
            // Add event listeners for the tabs
            setTimeout(() => {
                console.log("Setting up tab event listeners");
                const summaryTabBtn = summaryDiv.querySelector('#summaryTabBtn');
                const detailsTabBtn = summaryDiv.querySelector('#detailsTabBtn');
                const summaryTabBtn2 = detailsDiv.querySelector('#summaryTabBtn2');
                const detailsTabBtn2 = detailsDiv.querySelector('#detailsTabBtn2');
                
                console.log("Summary tab buttons:", summaryTabBtn, summaryTabBtn2);
                console.log("Details tab buttons:", detailsTabBtn, detailsTabBtn2);
                
                // Function to switch to summary tab
                const showSummaryTab = () => {
                    console.log("Switching to summary tab");
                    // Update button states
                    if (summaryTabBtn) summaryTabBtn.classList.add('active');
                    if (detailsTabBtn) detailsTabBtn.classList.remove('active');
                    if (summaryTabBtn2) summaryTabBtn2.classList.add('active');
                    if (detailsTabBtn2) detailsTabBtn2.classList.remove('active');
                    
                    // Update visibility
                    summaryDiv.setAttribute('style', 'display: block !important');
                    detailsDiv.setAttribute('style', 'display: none !important');
                    if (configDiv) configDiv.style.display = 'none';
                };
                
                // Function to switch to details tab
                const showDetailsTab = () => {
                    console.log("Switching to details tab");
                    // Update button states
                    if (summaryTabBtn) summaryTabBtn.classList.remove('active');
                    if (detailsTabBtn) detailsTabBtn.classList.add('active');
                    if (summaryTabBtn2) summaryTabBtn2.classList.remove('active');
                    if (detailsTabBtn2) detailsTabBtn2.classList.add('active');
                    
                    // Force explicit styles to ensure visibility
                    summaryDiv.setAttribute('style', 'display: none !important');
                    detailsDiv.setAttribute('style', 'display: block !important');
                    if (configDiv) configDiv.style.display = 'none';
                    
                    // Debug the current state
                    console.log("After switch, details display computed:", window.getComputedStyle(detailsDiv).display);
                    console.log("Details div:", detailsDiv);
                    console.log("Details div HTML length:", detailsDiv.innerHTML.length);
                };
                
                // Add click handlers for summary tabs
                if (summaryTabBtn) {
                    summaryTabBtn.addEventListener('click', showSummaryTab);
                }
                if (summaryTabBtn2) {
                    summaryTabBtn2.addEventListener('click', showSummaryTab);
                }
                
                // Add click handlers for details tabs
                if (detailsTabBtn) {
                    detailsTabBtn.addEventListener('click', showDetailsTab);
                }
                if (detailsTabBtn2) {
                    detailsTabBtn2.addEventListener('click', showDetailsTab);
                }
            }, 100);
        }
        
        // Function to update the top bar metrics
        function updateTopBarMetrics() {
            console.log("Updating top bar metrics with:", metrics);
            
            // Update the yield metric
            const yieldElement = document.getElementById('yield-metric');
            if (yieldElement && metrics.rentalYield) {
                yieldElement.textContent = metrics.rentalYield;
                
                // Add color based on yield value
                const yieldValue = parseFloat(metrics.rentalYield);
                if (!isNaN(yieldValue)) {
                    if (yieldValue >= 5) {
                        yieldElement.style.color = '#10b981'; // Green
                    } else if (yieldValue < 3.5) {
                        yieldElement.style.color = '#ef4444'; // Red
                    }
                }
            }
            
            // Update the growth metric
            const growthElement = document.getElementById('growth-metric');
            if (growthElement && metrics.suburbGrowthRate) {
                const growthValue = (metrics.suburbGrowthRate * 100).toFixed(2);
                growthElement.textContent = `${growthValue}%`;
                
                // Add color based on growth value
                if (!isNaN(growthValue)) {
                    if (growthValue >= 10) {
                        growthElement.style.color = '#10b981'; // Green
                    } else if (growthValue < 5) {
                        growthElement.style.color = '#ef4444'; // Red
                    }
                }
            }
            
            // Update the annual cash flow metric
            const annualCashflowElement = document.getElementById('annual-cashflow-metric');
            if (annualCashflowElement && metrics.annualCashFlow) {
                const cashflowValue = parseFloat(metrics.annualCashFlow);
                annualCashflowElement.textContent = isNaN(cashflowValue) ? 'N/A' : `$${Math.round(cashflowValue).toLocaleString()}`;
                
                // Add color based on cash flow value
                if (!isNaN(cashflowValue)) {
                    if (cashflowValue > 0) {
                        annualCashflowElement.style.color = '#10b981'; // Green
                    } else if (cashflowValue < 0) {
                        annualCashflowElement.style.color = '#ef4444'; // Red
                    }
                }
            }
            
            // Update the 5-Year IRR metric
            const irr5Element = document.getElementById('irr5-metric');
            if (irr5Element && metrics.irr5) {
                // Extract the numeric value from the IRR string (e.g., "15.6%" -> 15.6)
                const irrMatch = metrics.irr5.match(/(\d+\.\d+)/);
                const irrValue = irrMatch ? parseFloat(irrMatch[1]) : NaN;
                
                irr5Element.textContent = isNaN(irrValue) ? 'N/A' : `${irrValue.toFixed(2)}%`;
                
                // Add color based on IRR value
                if (!isNaN(irrValue)) {
                    if (irrValue >= 15) {
                        irr5Element.style.color = '#10b981'; // Green
                    } else if (irrValue < 8) {
                        irr5Element.style.color = '#ef4444'; // Red
                    }
                }
            }
            
            // Check for planning overlays and show alert if detected
            const planningAlertsElement = document.getElementById('planning-alerts');
            const planningAlertMetricElement = document.getElementById('planning-alert-metric');
            
            if (planningAlertsElement && planningAlertMetricElement) {
                // Get planning info from global variable
                const planningInfo = window.propertyPlanningInfo || { overlays: [], zone: 'Unknown' };
                
                // Check if any significant planning overlays are detected
                const significantOverlays = planningInfo.overlays.filter(overlay => 
                    overlay.status === 'Detected' && 
                    (overlay.type.toLowerCase().includes('bushfire') || 
                     overlay.type.toLowerCase().includes('flood') || 
                     overlay.type.toLowerCase().includes('heritage') ||
                     overlay.type.toLowerCase().includes('environmental'))
                );
                
                if (significantOverlays.length > 0) {
                    // Show the planning alerts element
                    planningAlertsElement.style.display = 'flex';
                    
                    // Get the first significant overlay
                    const overlay = significantOverlays[0];
                    
                    // Set the alert text
                    planningAlertMetricElement.textContent = overlay.type;
                    planningAlertMetricElement.style.color = '#ef4444'; // Red for alert
                    
                    // Set a tooltip if available
                    if (overlay.description) {
                        planningAlertMetricElement.title = overlay.description;
                    }
                } else {
                    // Hide the planning alerts element if no significant overlays
                    planningAlertsElement.style.display = 'none';
                }
            }
        }

        // Initialize UI content
        // You would need to set the content of these elements here
        // This is just a placeholder
        barDiv.innerHTML = `<div>Property Insights Bar</div>`;
        summaryDiv.innerHTML = `<div>Summary Content</div>`;
        detailsDiv.innerHTML = `<div>Details Content</div>`;
        configDiv.innerHTML = `
            <div class="insights-section">
                <h3 class="insights-section-title">Investment Assumptions</h3>
                <!-- LVR Input -->
                <div class="config-section">
                    <label class="property-label" for="lvrRateInput">Loan-to-Value Ratio (%)</label>
                    <input type="number" id="lvrRateInput" class="property-input" value="80" min="0" max="100">
                </div>
                <!-- Interest Rate Input -->
                <div class="config-section">
                    <label class="property-label" for="interestRateInput">Interest Rate (%)</label>
                    <input type="number" id="interestRateInput" class="property-input" value="6.22" min="0" max="20" step="0.01">
                </div>
                <!-- Construction Cost Input -->
                <div class="config-section">
                    <label class="property-label" for="constructionCostInput">Construction Cost (% of Property)</label>
                    <input type="number" id="constructionCostInput" class="property-input" value="40" min="0" max="100">
                </div>
                <!-- Fittings Value Input -->
                <div class="config-section">
                    <label class="property-label" for="fittingsValueInput">Fittings Value ($)</label>
                    <input type="number" id="fittingsValueInput" class="property-input" value="10000" min="0">
                </div>
                <!-- Suburb Growth Rate Input -->
                <div class="config-section">
                    <label class="property-label" for="suburbGrowthRateInput">Suburb Growth Rate (%)</label>
                    <input type="number" id="suburbGrowthRateInput" class="property-input" value="14.37" min="-20" max="30" step="0.01">
                </div>
                <!-- Rental Growth Rate Input -->
                <div class="config-section">
                    <label class="property-label" for="rentalGrowthRateInput">Rental Growth Rate (%)</label>
                    <input type="number" id="rentalGrowthRateInput" class="property-input" value="3" min="-20" max="30" step="0.01">
                </div>
                <!-- Management Fee Input -->
                <div class="config-section">
                    <label class="property-label" for="managementFeeInput">Management Fee (%)</label>
                    <input type="number" id="managementFeeInput" class="property-input" value="8" min="0" max="20" step="0.1">
                </div>
                <!-- Vacancy Rate Input -->
                <div class="config-section">
                    <label class="property-label" for="vacancyRateInput">Vacancy Rate (%)</label>
                    <input type="number" id="vacancyRateInput" class="property-input" value="5" min="0" max="100" step="0.1">
                </div>
                <!-- Strata Input -->
                <div class="config-section">
                    <label class="property-label" for="strataInput">Strata/Body Corp ($)</label>
                    <input type="number" id="strataInput" class="property-input" value="5000" min="0">
                </div>
                <!-- Council Rates Input -->
                <div class="config-section">
                    <label class="property-label" for="councilRatesInput">Council Rates ($)</label>
                    <input type="number" id="councilRatesInput" class="property-input" value="1200" min="0">
                </div>
                <!-- Insurance Input -->
                <div class="config-section">
                    <label class="property-label" for="insuranceInput">Insurance ($)</label>
                    <input type="number" id="insuranceInput" class="property-input" value="1500" min="0">
                </div>
                <!-- Income A Input -->
                <div class="config-section">
                    <label class="property-label" for="incomeAInput">Income A ($)</label>
                    <input type="number" id="incomeAInput" class="property-input" value="215000" min="0">
                </div>
                <!-- Income B Input -->
                <div class="config-section">
                    <label class="property-label" for="incomeBInput">Income B ($)</label>
                    <input type="number" id="incomeBInput" class="property-input" value="110000" min="0">
                </div>
                <!-- Allocation A Input -->
                <div class="config-section">
                    <label class="property-label" for="allocationAInput">Allocation A (%)</label>
                    <input type="number" id="allocationAInput" class="property-input" value="50" min="0" max="100">
                </div>
                <!-- Allocation B Input -->
                <div class="config-section">
                    <label class="property-label" for="allocationBInput">Allocation B (%)</label>
                    <input type="number" id="allocationBInput" class="property-input" value="50" min="0" max="100">
                </div>
                <!-- Apply Button -->
                <button id="applyConfigBtn" class="btn-primary" style="width: 100%; margin-top: 10px;">Apply Changes</button>
            </div>
        `;

        // Function to update suburb data display
        function updateSuburbDataDisplay(element, data, suburb, state, postcode) {
            if (data && Object.keys(data.medianPrices || {}).length > 0) {
                // Create a formatted display of median prices
                let priceRows = '';
                for (const [key, price] of Object.entries(data.medianPrices)) {
                    if (price !== '-') {
                        const [bedrooms, type] = key.split('-');
                        
                        // Compare with current property price if available
                        let priceComparison = '';
                        const cleanPrice = price.replace(/[^0-9]/g, '');
                        const currentPropertyPrice = originalPrice.replace(/[^0-9]/g, '');
                        
                        if (cleanPrice && currentPropertyPrice) {
                            const medianPrice = parseInt(cleanPrice);
                            const propertyPrice = parseInt(currentPropertyPrice);
                            
                            if (propertyPrice < medianPrice * 0.9) {
                                priceComparison = `<span class="ps-text-green-600 ps-text-xs ps-ml-1">Below median</span>`;
                            } else if (propertyPrice > medianPrice * 1.1) {
                                priceComparison = `<span class="ps-text-red-600 ps-text-xs ps-ml-1">Above median</span>`;
                            } else {
                                priceComparison = `<span class="ps-text-amber-600 ps-text-xs ps-ml-1">At median</span>`;
                            }
                        }
                        
                        priceRows += `
                            <div class="ps-flex ps-justify-between ps-items-center ps-mb-1">
                                <span class="ps-text-sm"><span class="ps-font-medium">${bedrooms} bed ${type}:</span></span>
                                <span class="ps-font-medium">${price}${priceComparison}</span>
                            </div>
                        `;
                    }
                }
                
                // Calculate average days on market if available
                let avgDays = 'N/A';
                let daysCount = 0;
                let daysSum = 0;
                for (const [key, days] of Object.entries(data.avgDaysOnMarket || {})) {
                    if (days !== '-') {
                        const daysNum = parseInt(days);
                        if (!isNaN(daysNum)) {
                            daysSum += daysNum;
                            daysCount++;
                        }
                    }
                }
                if (daysCount > 0) {
                    avgDays = Math.round(daysSum / daysCount);
                }
                
                // Calculate total properties sold
                let totalSold = 0;
                for (const [key, sold] of Object.entries(data.soldThisYear || {})) {
                    const soldNum = parseInt(sold);
                    if (!isNaN(soldNum)) {
                        totalSold += soldNum;
                    }
                }
                
                // Determine market activity indicator 
                let marketActivityClass = 'ps-bg-amber-500';
                let marketActivityText = 'Average';
                
                if (avgDays !== 'N/A') {
                    if (avgDays < 20) {
                        marketActivityClass = 'ps-bg-green-500';
                        marketActivityText = 'Very Active';
                    } else if (avgDays < 30) {
                        marketActivityClass = 'ps-bg-green-400';
                        marketActivityText = 'Active';
                    } else if (avgDays < 45) {
                        marketActivityClass = 'ps-bg-amber-400';
                        marketActivityText = 'Average';
                    } else if (avgDays < 60) {
                        marketActivityClass = 'ps-bg-red-400';
                        marketActivityText = 'Slow';
                    } else {
                        marketActivityClass = 'ps-bg-red-500';
                        marketActivityText = 'Very Slow';
                    }
                }

                element.innerHTML = `
                    <div class="property-scanner-component ps-bg-white ps-rounded-lg ps-shadow ps-text-sm ps-mb-3 ps-overflow-hidden">
                        <div class="ps-bg-blue-600 ps-text-white ps-p-3">
                            <h4 class="ps-font-medium ps-mb-1 ps-flex ps-items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ps-mr-2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                                Suburb Insights: ${suburb}, ${state} ${postcode}
                            </h4>
                            <p class="ps-text-xs ps-text-blue-100">Market overview and property comparisons</p>
                        </div>
                        
                        <div class="ps-p-4">
                            <div class="ps-grid ps-grid-cols-1 ps-lg-grid-cols-2 ps-gap-6">
                                <!-- Left column: Median Prices -->
                                <div>
                                    <h5 class="ps-font-medium ps-mb-3 ps-text-gray-700 ps-flex ps-items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ps-text-blue-500 ps-mr-1">
                                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                        </svg>
                                        Median Property Prices
                                    </h5>
                                    
                                    <div class="ps-bg-gray-50 ps-p-3 ps-rounded ps-border ps-border-gray-200">
                                        ${priceRows || '<p class="ps-text-sm">No price data available</p>'}
                                        
                                        <div class="ps-mt-2 ps-pt-2 ps-border-t ps-border-gray-200">
                                            <div class="ps-flex ps-justify-between ps-items-center">
                                                <span class="ps-text-xs ps-text-gray-500">This Property:</span>
                                                <span class="ps-font-medium">${originalPrice}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Right column: Market Activity -->
                                <div>
                                    <h5 class="ps-font-medium ps-mb-3 ps-text-gray-700 ps-flex ps-items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ps-text-blue-500 ps-mr-1">
                                            <path d="M5 3v16h16"></path>
                                            <path d="m5 16 7-8 4 4 7-8"></path>
                                        </svg>
                                        Market Activity
                                    </h5>
                                    
                                    <div class="ps-bg-gray-50 ps-p-3 ps-rounded ps-border ps-border-gray-200">
                                        <div class="ps-flex ps-items-center ps-mb-3">
                                            <div class="ps-w-2-3">
                                                <p class="ps-text-sm"><span class="ps-font-medium">Market Speed:</span></p>
                                                <div class="ps-h-2 ps-bg-gray-200 ps-rounded-full ps-mt-1">
                                                    <div class="${marketActivityClass} ps-h-2 ps-rounded-full" style="width: ${avgDays === 'N/A' ? '50%' : Math.min(100, Math.max(10, (60 - avgDays) * 1.6)) + '%'}"></div>
                                                </div>
                                            </div>
                                            <div class="ps-w-1-3 ps-text-right">
                                                <span class="ps-text-sm ps-font-medium">${marketActivityText}</span>
                                                <p class="ps-text-xs ps-text-gray-500">${avgDays === 'N/A' ? 'N/A' : avgDays + ' days'}</p>
                                            </div>
                                        </div>
                                        
                                        <div class="ps-flex ps-justify-between ps-mb-3">
                                            <p class="ps-text-sm"><span class="ps-font-medium">Properties Sold (12m):</span></p>
                                            <p class="ps-text-sm ps-font-medium">${totalSold}</p>
                                        </div>
                                        
                                        ${data.population ? `
                                        <div class="ps-flex ps-justify-between ps-mb-1">
                                            <p class="ps-text-sm"><span class="ps-font-medium">Population:</span></p>
                                            <p class="ps-text-sm ps-font-medium">${data.population}</p>
                                        </div>
                                        ` : ''}
                                        
                                        ${data.medianAge ? `
                                        <div class="ps-flex ps-justify-between">
                                            <p class="ps-text-sm"><span class="ps-font-medium">Median Age:</span></p>
                                            <p class="ps-text-sm ps-font-medium">${data.medianAge} years</p>
                                        </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Market Summary Card -->
                            <div class="ps-mt-4 ps-bg-blue-50 ps-p-3 ps-rounded ps-border ps-border-blue-100">
                                <h5 class="ps-font-medium ps-mb-2 ps-text-gray-700 ps-text-sm">Market Summary</h5>
                                <p class="ps-text-sm ps-text-gray-600">
                                    ${(() => {
                                        // Generate market summary based on data
                                        if (avgDays === 'N/A' && totalSold === 0) {
                                            return `Limited market data available for ${suburb}. Consider researching recent comparable sales in the area.`;
                                        }
                                        
                                        let summary = '';
                                        if (avgDays !== 'N/A') {
                                            if (avgDays < 20) {
                                                summary += `${suburb} is currently a <span class="ps-font-medium ps-text-green-600">hot market</span> with properties selling very quickly (${avgDays} days average). `;
                                            } else if (avgDays < 30) {
                                                summary += `${suburb} has an <span class="ps-font-medium ps-text-green-600">active market</span> with properties selling in ${avgDays} days on average. `;
                                            } else if (avgDays < 45) {
                                                summary += `${suburb} has an <span class="ps-font-medium ps-text-amber-600">average-paced market</span> with properties taking ${avgDays} days to sell. `;
                                            } else {
                                                summary += `${suburb} has a <span class="ps-font-medium ps-text-red-600">slower market</span> with properties taking ${avgDays} days on average to sell. `;
                                            }
                                        }
                                        
                                        if (totalSold > 0) {
                                            if (totalSold > 200) {
                                                summary += `With ${totalSold} properties sold in the last 12 months, this is a <span class="ps-font-medium ps-text-green-600">high-volume market</span> with plenty of comparable sales data.`;
                                            } else if (totalSold > 100) {
                                                summary += `With ${totalSold} properties sold in the last 12 months, this is an <span class="ps-font-medium ps-text-green-600">active market</span> with good sales volume.`;
                                            } else if (totalSold > 50) {
                                                summary += `${totalSold} properties sold in the last 12 months indicates a <span class="ps-font-medium ps-text-amber-600">moderate market volume</span>.`;
                                            } else {
                                                summary += `Only ${totalSold} properties sold in the last 12 months, indicating a <span class="ps-font-medium ps-text-red-600">lower volume market</span>.`;
                                            }
                                        }
                                        
                                        return summary;
                                    })()}
                                </p>
                            </div>
                            
                            <p class="ps-text-xs ps-text-gray-500 ps-mt-2 ps-italic">Data sourced from ${data.source || 'domain.com.au'}</p>
                        </div>
                    </div>
                `;
            } else {
                element.innerHTML = `
                    <div class="property-scanner-component ps-bg-white ps-rounded-lg ps-shadow ps-text-sm ps-mb-3 ps-overflow-hidden">
                        <div class="ps-bg-blue-600 ps-text-white ps-p-3">
                            <h4 class="ps-font-medium ps-mb-1 ps-flex ps-items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ps-mr-2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                                Suburb Insights: ${suburb}, ${state} ${postcode}
                            </h4>
                        </div>
                        <div class="ps-p-4">
                            <p class="ps-text-sm">No suburb data available. <a href="https://www.domain.com.au/suburb-profile/${suburb.toLowerCase()}-${state.toLowerCase()}-${postcode}" target="_blank" class="ps-text-blue-600 ps-underline">View on Domain</a></p>
                        </div>
                    </div>
                `;
            }
        }
        
        // Calculate initial metrics
        calculateMetrics(currentPrice, currentRental, config, state, suburb, postcode, function(calculatedMetrics) {
            metrics = calculatedMetrics;
            
            // Update the display with the calculated metrics
            updateDisplay();
            updateTopBarMetrics();
            
            // Fetch suburb demographics for additional data
            fetchSuburbDemographics(suburb, state, postcode, function(demographicsData) {
                if (demographicsData) {
                    console.log('Suburb demographics data:', demographicsData);
                    // Update UI with demographic data
                    const suburbDataElement = document.getElementById('suburb-data-container');
                    if (suburbDataElement) {
                        updateSuburbDataDisplay(suburbDataElement, demographicsData, suburb, state, postcode);
                    }
                }
            });
        });
        
        // Ensure styles are explicitly created and added
        let styleElement = document.getElementById('property-insights-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'property-insights-styles';
            styleElement.textContent = `
                #property-insights-bar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    background-color: white;
                    border-bottom: 1px solid #ddd;
                    z-index: 9999;
                    padding: 8px 12px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                #property-insights-panel {
                    position: fixed;
                    top: 40px;
                    left: 0;
                    width: 90%;
                    max-width: 1200px;
                    background-color: white;
                    border-right: 1px solid #ddd;
                    border-bottom: 1px solid #ddd;
                    z-index: 9998;
                    max-height: calc(100vh - 40px);
                    overflow-y: auto;
                    padding: 0;
                    display: none;
                    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                
                .metrics-container {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    gap: 12px;
                    width: 100%;
                }
                
                .metric {
                    display: flex;
                    align-items: center;
                    white-space: nowrap;
                    min-width: 100px;
                }
                
                .metric-label {
                    font-size: 0.75rem;
                    color: #555;
                    margin-right: 4px;
                }
                
                .metric-value {
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #333;
                }
                
                .controls {
                    display: flex;
                    gap: 6px;
                    margin-left: auto;
                }
                
                #toggleButton, #cogButton {
                    background-color: #f5f5f5;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 4px 10px;
                    font-size: 0.8rem;
                    cursor: pointer;
                }
                
                .hidden {
                    display: none !important;
                }
                
                .positive {
                    color: #10b981;
                }
                
                .negative {
                    color: #ef4444;
                }
            `;
            document.head.appendChild(styleElement);
            console.log('Added property insights styles to document head');
        }
        
        // Add event listener for the Apply button in config panel
        setTimeout(() => {
            const applyConfigBtn = configDiv.querySelector('#applyConfigBtn');
            if (applyConfigBtn) {
                applyConfigBtn.addEventListener('click', function() {
                    // Get all input values
                    const lvrRate = parseFloat(configDiv.querySelector('#lvrRateInput').value) / 100;
                    const interestRate = parseFloat(configDiv.querySelector('#interestRateInput').value) / 100;
                    const constructionCostPercent = parseFloat(configDiv.querySelector('#constructionCostInput').value) / 100;
                    const fittingsValue = parseFloat(configDiv.querySelector('#fittingsValueInput').value);
                    const suburbGrowthRate = parseFloat(configDiv.querySelector('#suburbGrowthRateInput').value) / 100;
                    const rentalGrowthRate = parseFloat(configDiv.querySelector('#rentalGrowthRateInput').value) / 100;
                    const managementFee = parseFloat(configDiv.querySelector('#managementFeeInput').value) / 100;
                    const vacancyRate = parseFloat(configDiv.querySelector('#vacancyRateInput').value) / 100;
                    const strata = parseFloat(configDiv.querySelector('#strataInput').value);
                    const councilRates = parseFloat(configDiv.querySelector('#councilRatesInput').value);
                    const insurance = parseFloat(configDiv.querySelector('#insuranceInput').value);
                    const incomeA = parseFloat(configDiv.querySelector('#incomeAInput').value);
                    const incomeB = parseFloat(configDiv.querySelector('#incomeBInput').value);
                    const allocationA = parseFloat(configDiv.querySelector('#allocationAInput').value) / 100;
                    const allocationB = parseFloat(configDiv.querySelector('#allocationBInput').value) / 100;
                    
                    // Update config with new values
                    const priceValue = parseFloat(currentPrice.replace(/[^\d.-]/g, ''));
                    config.lvrRate = lvrRate;
                    config.interestRate = interestRate;
                    config.constructionCost = priceValue * constructionCostPercent;
                    config.fittingsValue = fittingsValue;
                    config.suburbGrowthRate = suburbGrowthRate;
                    config.rentalGrowthRate = rentalGrowthRate;
                    config.managementFee = managementFee;
                    config.vacancyRate = vacancyRate;
                    config.strata = strata;
                    config.councilRates = councilRates;
                    config.insurance = insurance;
                    config.incomeA = incomeA;
                    config.incomeB = incomeB;
                    config.allocationA = allocationA;
                    config.allocationB = allocationB;
                    
                    // Save to GM_setValue for persistence
                    GM_setValue('lvrRate', lvrRate);
                    GM_setValue('interestRate', interestRate);
                    GM_setValue('constructionCost', config.constructionCost);
                    GM_setValue('fittingsValue', fittingsValue);
                    GM_setValue('rentalGrowthRate', rentalGrowthRate);
                    GM_setValue('managementFee', managementFee);
                    GM_setValue('vacancyRate', vacancyRate);
                    GM_setValue('incomeA', incomeA);
                    GM_setValue('incomeB', incomeB);
                    GM_setValue('allocationA', allocationA);
                    GM_setValue('allocationB', allocationB);
                    
                    // Recalculate metrics with new config
                    calculateMetrics(currentPrice, currentRental, config, state, suburb, postcode, function(updatedMetrics) {
                        metrics = updatedMetrics;
                        updateDisplay();
                        updateTopBarMetrics();
                        
                        // Show the summary view
                        configDiv.classList.add('hidden');
                        summaryDiv.classList.remove('hidden');
                        
                        // Add a notification
                        const notification = document.createElement('div');
                        notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
                        notification.textContent = 'Investment assumptions updated!';
                        document.body.appendChild(notification);
                        
                        // Remove notification after 3 seconds
                        setTimeout(() => {
                            if (notification.parentNode) {
                                notification.parentNode.removeChild(notification);
                            }
                        }, 3000);
                    });
                });
            }
        }, 0);

        // Append elements to the body - ensure it's the first element and doesn't block the menu
        if (document.body) {
            console.log('Appending bar and insights panel to the DOM');
            
            // Force visibility with explicit styles
            barDiv.style.display = 'flex';
            infoDiv.style.display = 'none'; // Panel starts hidden but bar should be visible
            
            // Insert at the very top, but with correct z-index to not block menus
            document.body.insertBefore(infoDiv, document.body.firstChild);
            document.body.insertBefore(barDiv, document.body.firstChild);
            
            // Debug logging
            console.log('barDiv added to DOM:', barDiv);
            console.log('barDiv display style:', window.getComputedStyle(barDiv).display);
            console.log('barDiv z-index:', window.getComputedStyle(barDiv).zIndex);
            console.log('barDiv position:', window.getComputedStyle(barDiv).position);
            
            // More precise layout adjustment
            adjustPageLayout();
            
            // Remove any body padding that might have been added by loading bar
            document.body.style.paddingTop = '';
            
            // Force a redraw/reflow
            void barDiv.offsetHeight;
        } else {
            console.error('document.body is not available');
        }
    }

    // Performance optimization: Lazy load less critical resources
    function lazyLoadResources() {
        // Only load font awesome if needed and not already loaded
        if (!document.querySelector('link[href*="font-awesome"]')) {
            let fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
    }
    
    // Parallel data fetching for improved performance
    function parallelDataFetch(address, callback) {
        console.log('Starting parallel data fetch for address: ', address);
        
        getPID(address, function(pid, source) {
            if (pid) {
                const url = constructPropertyUrl(pid, source);
                if (url) {
                    // Store the source URL for linking
                    window.propertySourceUrl = url;
                    
                    fetchPropertyData(url, function(price, rental, soldHistory, planningInfo) {
                        // Store sold history and planning info in global variables
                        window.propertySoldHistory = soldHistory;
                        window.propertyPlanningInfo = planningInfo;
                        callback(price, rental);
                    });
                } else {
                    console.error('Failed to construct property URL');
                    let fallbackData = getFallbackData();
                    callback(fallbackData.price, fallbackData.rental);
                }
            } else {
                console.error('No property ID found for address: ', address);
                let fallbackData = getFallbackData();
                callback(fallbackData.price, fallbackData.rental);
            }
        });
    }

    // Main execution with performance improvements
    console.log('Script started on: ', window.location.href);
    
    // Load non-critical resources lazily
    setTimeout(lazyLoadResources, 0);
    
    // Start extracting data immediately
    let address = getAddress();
    if (address) {
        parallelDataFetch(address, function(price, rental) {
            displayData(price, rental, address);
        });
    } else {
        // If address not found initially, retry after short delay
        setTimeout(() => {
            address = getAddress();
            if (address) {
                parallelDataFetch(address, function(price, rental) {
                    displayData(price, rental, address);
                });
            } else {
                console.error('No address found after retry, script aborted');
                // Remove loading indicator if we can't proceed
                if (loadingBar && loadingBar.parentNode) {
                    loadingBar.parentNode.removeChild(loadingBar);
                }
            }
        }, 1000);
    }
})();