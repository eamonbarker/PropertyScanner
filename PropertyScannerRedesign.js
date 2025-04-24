// PropertyScannerRedesign.js
// This is a test file to demonstrate the redesign approach

(function() {
    // This function would be called when the property page is loaded
    function initPropertyScanner() {
        // Create stylesheet with all the necessary styles
        function injectStyles() {
            const styleElement = document.createElement('style');
            styleElement.id = 'property-scanner-styles';
            
            styleElement.textContent = `
                /* Reset and base styles */
                .ps-component * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                }
                
                /* Layout styles */
                .ps-container {
                    max-width: 100%;
                    margin: 0 auto;
                    padding: 15px;
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                
                /* Grid system */
                .ps-grid {
                    display: grid;
                    grid-gap: 15px;
                }
                
                .ps-grid-cols-1 { grid-template-columns: 1fr; }
                .ps-grid-cols-2 { grid-template-columns: 1fr 1fr; }
                .ps-grid-cols-3 { grid-template-columns: 1fr 1fr 1fr; }
                
                @media (max-width: 768px) {
                    .ps-grid-cols-2, .ps-grid-cols-3 {
                        grid-template-columns: 1fr;
                    }
                }
                
                /* Card components */
                .ps-card {
                    background-color: #fff;
                    border-radius: 6px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                
                .ps-card-header {
                    padding: 12px 15px;
                    background-color: #f8f9fa;
                    border-bottom: 1px solid #eaeaea;
                }
                
                .ps-card-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #333;
                }
                
                .ps-card-body {
                    padding: 15px;
                }
                
                /* Typography */
                .ps-title {
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 15px;
                    color: #333;
                }
                
                .ps-subtitle {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 10px;
                    color: #444;
                }
                
                .ps-text {
                    font-size: 14px;
                    line-height: 1.4;
                    color: #555;
                }
                
                .ps-text-sm {
                    font-size: 13px;
                }
                
                .ps-text-xs {
                    font-size: 12px;
                }
                
                /* Colors */
                .ps-text-success { color: #28a745; }
                .ps-text-warning { color: #ffc107; }
                .ps-text-danger { color: #dc3545; }
                .ps-text-info { color: #17a2b8; }
                .ps-text-muted { color: #6c757d; }
                
                .ps-bg-success { background-color: #d4edda; }
                .ps-bg-warning { background-color: #fff3cd; }
                .ps-bg-danger { background-color: #f8d7da; }
                .ps-bg-info { background-color: #d1ecf1; }
                
                /* Flexbox utilities */
                .ps-flex {
                    display: flex;
                }
                
                .ps-justify-between {
                    justify-content: space-between;
                }
                
                .ps-items-center {
                    align-items: center;
                }
                
                /* Spacing */
                .ps-mt-1 { margin-top: 5px; }
                .ps-mt-2 { margin-top: 10px; }
                .ps-mt-3 { margin-top: 15px; }
                .ps-mb-1 { margin-bottom: 5px; }
                .ps-mb-2 { margin-bottom: 10px; }
                .ps-mb-3 { margin-bottom: 15px; }
                
                /* Border and radius */
                .ps-rounded { border-radius: 4px; }
                .ps-border { border: 1px solid #eaeaea; }
                
                /* Status indicator */
                .ps-indicator {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                }
                
                /* Progress bar */
                .ps-progress-container {
                    height: 8px;
                    background-color: #e9ecef;
                    border-radius: 4px;
                    margin: 8px 0;
                }
                
                .ps-progress-bar {
                    height: 100%;
                    border-radius: 4px;
                }
                
                .ps-progress-success { background-color: #28a745; }
                .ps-progress-warning { background-color: #ffc107; }
                .ps-progress-danger { background-color: #dc3545; }
            `;
            
            document.head.appendChild(styleElement);
        }
        
        // Create the actual UI components
        function createPropertyInsightsUI(data) {
            // Sample data structure - this would come from your API/data processing logic
            const propertyData = data || {
                address: "123 Main St, Suburb, State 1234",
                price: "$549,000",
                rental: "$520 per week",
                yield: "4.93%",
                cashFlow: -4582.28,
                irr10yr: "32.68%",
                worthBuying: false,
                suburb: {
                    name: "Suburb",
                    state: "State",
                    postcode: "1234",
                    medianPrices: {
                        "3bed-house": "$594,000",
                        "4bed-house": "$668,000"
                    },
                    avgDaysOnMarket: 26,
                    propertiesSold: 223,
                    population: "12,345",
                    medianAge: 35
                },
                financialOverview: {
                    preTaxCashFlow: -15233.44,
                    afterTaxCashFlow: -4582.28,
                    rentalYield: "4.93%",
                    breakEvenYear: "N/A",
                    cumulativeProfitLoss10yr: -83882
                }
            };
            
            // Create the container element
            const container = document.createElement('div');
            container.className = 'ps-component ps-container';
            
            // Financial Overview Section
            const financialOverview = document.createElement('div');
            financialOverview.className = 'ps-card ps-mb-3';
            
            // Recommendation banner
            const recommendationClass = propertyData.worthBuying ? 'ps-bg-success' : 'ps-bg-danger';
            const recommendationText = propertyData.worthBuying ? 'RECOMMENDED' : 'NOT RECOMMENDED';
            const recommendationTextClass = propertyData.worthBuying ? 'ps-text-success' : 'ps-text-danger';
            
            financialOverview.innerHTML = `
                <div class="ps-card-header">
                    <h3 class="ps-card-title">Financial Overview</h3>
                </div>
                <div class="ps-card-body">
                    <!-- Recommendation Banner -->
                    <div class="ps-rounded ${recommendationClass} ps-flex ps-justify-between ps-items-center ps-mb-3" style="padding: 10px 15px;">
                        <div>
                            <span class="ps-subtitle ${recommendationTextClass}">${recommendationText}</span>
                            <p class="ps-text-sm">Based on cash flow, return metrics, and long-term profitability</p>
                        </div>
                        <div>
                            ${propertyData.worthBuying ? 
                                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ps-text-success"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' :
                                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ps-text-danger"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
                            }
                        </div>
                    </div>
                    
                    <!-- Property Details -->
                    <div class="ps-grid ps-grid-cols-2 ps-mb-3">
                        <div class="ps-card ps-border">
                            <div class="ps-card-body">
                                <p class="ps-text-xs ps-text-muted">Purchase Price</p>
                                <p class="ps-subtitle">${propertyData.price}</p>
                            </div>
                        </div>
                        <div class="ps-card ps-border">
                            <div class="ps-card-body">
                                <p class="ps-text-xs ps-text-muted">Weekly Rental</p>
                                <p class="ps-subtitle">${propertyData.rental}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Cash Flow Analysis -->
                    <div class="ps-card ps-border ps-mb-3">
                        <div class="ps-card-body">
                            <h4 class="ps-subtitle ps-mb-2">Cash Flow Analysis</h4>
                            
                            <div class="ps-mb-2">
                                <div class="ps-flex ps-justify-between ps-mb-1">
                                    <span class="ps-text-sm">After-Tax Cash Flow:</span>
                                    <span class="ps-text-sm ${propertyData.financialOverview.afterTaxCashFlow >= 0 ? 'ps-text-success' : 'ps-text-danger'}">
                                        $${propertyData.financialOverview.afterTaxCashFlow.toLocaleString()}
                                    </span>
                                </div>
                                
                                <div class="ps-progress-container">
                                    <div class="ps-progress-bar ${propertyData.financialOverview.afterTaxCashFlow >= 0 ? 'ps-progress-success' : 'ps-progress-danger'}" 
                                         style="width: ${Math.min(100, Math.abs(propertyData.financialOverview.afterTaxCashFlow / 500))}%">
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <div class="ps-flex ps-justify-between ps-mb-1">
                                    <span class="ps-text-sm">Pre-Tax Cash Flow:</span>
                                    <span class="ps-text-sm ${propertyData.financialOverview.preTaxCashFlow >= 0 ? 'ps-text-success' : 'ps-text-danger'}">
                                        $${propertyData.financialOverview.preTaxCashFlow.toLocaleString()}
                                    </span>
                                </div>
                                
                                <div class="ps-progress-container">
                                    <div class="ps-progress-bar ${propertyData.financialOverview.preTaxCashFlow >= 0 ? 'ps-progress-success' : 'ps-progress-danger'}" 
                                         style="width: ${Math.min(100, Math.abs(propertyData.financialOverview.preTaxCashFlow / 500))}%">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Return Metrics -->
                    <div class="ps-card ps-border ps-mb-3">
                        <div class="ps-card-body">
                            <h4 class="ps-subtitle ps-mb-2">Return Metrics</h4>
                            
                            <div class="ps-grid ps-grid-cols-2 ps-mb-2">
                                <div>
                                    <p class="ps-text-xs ps-text-muted">Rental Yield</p>
                                    <div class="ps-flex ps-items-center">
                                        <span class="ps-text">${propertyData.yield}</span>
                                        <span class="ps-text-warning ps-ml-1">
                                            ★★★★☆
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p class="ps-text-xs ps-text-muted">10-Year IRR</p>
                                    <div class="ps-flex ps-items-center">
                                        <span class="ps-text ps-text-success">${propertyData.irr10yr}</span>
                                        <span class="ps-text-warning ps-ml-1">
                                            ★★★★★
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="ps-grid ps-grid-cols-2">
                                <div>
                                    <p class="ps-text-xs ps-text-muted">Break-Even</p>
                                    <p class="ps-text ${propertyData.financialOverview.breakEvenYear === 'N/A' ? 'ps-text-danger' : 'ps-text-success'}">
                                        ${propertyData.financialOverview.breakEvenYear}
                                    </p>
                                </div>
                                <div>
                                    <p class="ps-text-xs ps-text-muted">Cash on Cash (After Tax)</p>
                                    <p class="ps-text ps-text-danger">-2.56%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Append the financial overview section
            container.appendChild(financialOverview);
            
            // Suburb Insights Section
            const suburbInsights = document.createElement('div');
            suburbInsights.className = 'ps-card ps-mb-3';
            
            suburbInsights.innerHTML = `
                <div class="ps-card-header" style="background-color: #3498db; color: white;">
                    <h3 class="ps-card-title">Suburb Insights: ${propertyData.suburb.name}, ${propertyData.suburb.state} ${propertyData.suburb.postcode}</h3>
                </div>
                <div class="ps-card-body">
                    <div class="ps-grid ps-grid-cols-2">
                        <!-- Median Prices -->
                        <div>
                            <h4 class="ps-subtitle ps-mb-2">Median Prices</h4>
                            <div class="ps-card ps-border ps-mb-2">
                                <div class="ps-card-body">
                                    ${Object.entries(propertyData.suburb.medianPrices).map(([key, price]) => {
                                        const [bedrooms, type] = key.split('-');
                                        return `
                                            <div class="ps-flex ps-justify-between ps-mb-1">
                                                <span class="ps-text-sm">${bedrooms} bed ${type}:</span>
                                                <span class="ps-text-sm">${price}</span>
                                            </div>
                                        `;
                                    }).join('')}
                                    
                                    <div class="ps-mt-2 ps-pt-2" style="border-top: 1px solid #eaeaea;">
                                        <div class="ps-flex ps-justify-between">
                                            <span class="ps-text-xs ps-text-muted">This Property:</span>
                                            <span class="ps-text-sm">${propertyData.price}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Market Activity -->
                        <div>
                            <h4 class="ps-subtitle ps-mb-2">Market Activity</h4>
                            <div class="ps-card ps-border">
                                <div class="ps-card-body">
                                    <div class="ps-mb-2">
                                        <div class="ps-flex ps-justify-between ps-mb-1">
                                            <span class="ps-text-sm">Market Speed:</span>
                                            <span class="ps-text-sm">Active</span>
                                        </div>
                                        <div class="ps-progress-container">
                                            <div class="ps-progress-bar ps-progress-success" style="width: 75%"></div>
                                        </div>
                                        <p class="ps-text-xs ps-text-muted ps-text-right">${propertyData.suburb.avgDaysOnMarket} days</p>
                                    </div>
                                    
                                    <div class="ps-flex ps-justify-between ps-mb-1">
                                        <span class="ps-text-sm">Properties Sold (12m):</span>
                                        <span class="ps-text-sm">${propertyData.suburb.propertiesSold}</span>
                                    </div>
                                    
                                    <div class="ps-flex ps-justify-between ps-mb-1">
                                        <span class="ps-text-sm">Population:</span>
                                        <span class="ps-text-sm">${propertyData.suburb.population}</span>
                                    </div>
                                    
                                    <div class="ps-flex ps-justify-between">
                                        <span class="ps-text-sm">Median Age:</span>
                                        <span class="ps-text-sm">${propertyData.suburb.medianAge} years</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Market Summary -->
                    <div class="ps-card ps-border ps-mt-3" style="background-color: #f0f7ff;">
                        <div class="ps-card-body">
                            <h4 class="ps-subtitle ps-mb-1">Market Summary</h4>
                            <p class="ps-text">
                                ${propertyData.suburb.name} has an <span class="ps-text-success">active market</span> 
                                with properties selling in ${propertyData.suburb.avgDaysOnMarket} days on average. 
                                With ${propertyData.suburb.propertiesSold} properties sold in the last 12 months, 
                                this is an <span class="ps-text-success">active market</span> with good sales volume.
                            </p>
                        </div>
                    </div>
                    
                    <p class="ps-text-xs ps-text-muted ps-mt-2 ps-italic">Data sourced from domain.com.au</p>
                </div>
            `;
            
            // Append the suburb insights section
            container.appendChild(suburbInsights);
            
            return container;
        }
        
        // Initialize the UI
        function init() {
            // Inject styles first
            injectStyles();
            
            // Find a suitable container on the page
            const targetContainer = document.querySelector('.property-details') || document.body;
            
            if (targetContainer) {
                // Create UI with sample data for testing
                const propertyInsightsUI = createPropertyInsightsUI();
                
                // Append the UI to the page
                targetContainer.appendChild(propertyInsightsUI);
                
                console.log('PropertyScanner UI initialized successfully');
            } else {
                console.error('PropertyScanner: Could not find a suitable container');
            }
        }
        
        // Run initialization
        init();
    }

    // Execute when the page is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initPropertyScanner, 1000);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initPropertyScanner, 1000);
        });
    }
})(); 