# PropertyScanner

## Overview

PropertyScanner is a TamperMonkey user script designed to fetch and analyze property data from real estate listings. It provides detailed insights into property prices, rental estimates, investment metrics, and growth projections. The script features a modern UI with dynamic updates, graphs, and configurable settings for personalized analysis.

## Features

- **Data Fetching**: Extracts property data from `realestate.com.au` and supplements it with additional information from `property.com.au` and `yourinvestmentpropertymag.com.au`.
- **Investment Analysis**: Calculates key metrics such as rental yield, cash flow (pre-tax and after-tax), internal rate of return (IRR), and cash-on-cash returns.
- **Dynamic UI**: Displays insights in a floating bar and an expandable panel with interactive charts and configurable settings.
- **Customization**: Allows users to adjust parameters like interest rates, rental growth rates, and income allocations for tailored analysis.
- **Fallback Mechanism**: Uses fallback data extraction methods if primary sources fail to provide information.

## Installation

### Step 1: Install TamperMonkey

TamperMonkey is a browser extension that allows you to run user scripts on websites. Follow these steps to install it:

1. **Choose Your Browser**:
   - **Google Chrome**: Visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) and click "Add to Chrome".
   - **Mozilla Firefox**: Visit the [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) page and click "Add to Firefox".
   - **Microsoft Edge**: Visit the [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) page and click "Get".
   - **Safari**: Visit the [Mac App Store](https://apps.apple.com/us/app/tampermonkey/id1482490089?mt=12) and download the TamperMonkey app (note: it may require a purchase).

2. **Confirm Installation**: Once installed, you'll see the TamperMonkey icon in your browser's toolbar.

### Step 2: Install PropertyScanner Script

1. **Download the Script**: Download the `PropertyScanner.user.js` file from this repository or copy its contents.
2. **Add to TamperMonkey**:
   - Click the TamperMonkey icon in your browser toolbar and select "Create a new script...".
   - Replace the default content with the contents of `PropertyScanner.user.js`.
   - Click "File" > "Save" or press `Ctrl+S` (Windows) / `Cmd+S` (Mac) to save the script.
   - Alternatively, if you downloaded the file, you can click the TamperMonkey icon, select "Add a new script", and then click the "+" icon to upload the `.user.js` file directly.
3. **Enable the Script**: Ensure the script is enabled in the TamperMonkey dashboard (accessible via the icon > "Dashboard").

## Usage

1. **Visit a Property Listing**: Navigate to a property listing on `https://www.realestate.com.au/property-*` (the script is configured to run on these URLs).
2. **View Insights**: Once the page loads, a floating bar labeled "Property Insights" will appear at the top of the page. Click "Expand Insights" to view detailed analysis.
3. **Customize Settings**: Click the gear icon (⚙️) in the floating bar to access configuration options. Adjust parameters like interest rates, rental growth, and income details, then click "Save" to recalculate metrics.
4. **Interact with Data**: Use the dropdown to switch between weekly, fortnightly, monthly, or yearly cash flow views. Edit price and rental inputs directly to see updated calculations.

## Script Details

- **Version**: 2.6
- **Target URL**: `https://www.realestate.com.au/property-*`
- **Dependencies**: jQuery, Chart.js, Font Awesome, jQuery UI (loaded via CDN as specified in the script header).
- **Permissions**: Uses `GM.xmlHttpRequest`, `GM_setValue`, and `GM_getValue` for data fetching and storage.

## Troubleshooting

- **Script Not Running**: Ensure TamperMonkey is enabled and the script is active in the dashboard. Check if the URL matches the `@match` directive in the script header.
- **Data Not Displaying**: If data fails to load, the script will attempt to use fallback methods. Check the browser console (right-click > Inspect > Console) for error messages.
- **UI Issues**: If the floating bar or panel obstructs content, the script's CSS can be modified to adjust positioning.

## Contributing

Feel free to fork this repository, make improvements to the script, and submit pull requests. For bug reports or feature requests, open an issue in the repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details (if applicable, or add your own licensing information).
