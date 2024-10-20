// Function to convert a number into words in Indian format
function numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 
                  'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['Thousand', 'Lakh', 'Crore'];

    if (num === 0) return 'Zero';
    if (num < 0) return 'Negative ' + numberToWords(-num);
    
    let words = '';

    // Handle Crore
    const crore = Math.floor(num / 1e7);
    if (crore) {
        words += numberToWords(crore) + ' Crore ';
        num %= 1e7;
    }

    // Handle Lakh
    const lakh = Math.floor(num / 1e5);
    if (lakh) {
        words += numberToWords(lakh) + ' Lakh ';
        num %= 1e5;
    }

    // Handle Thousand
    const thousand = Math.floor(num / 1000);
    if (thousand) {
        words += numberToWords(thousand) + ' Thousand ';
        num %= 1000;
    }

    // Handle Hundred
    const hundred = Math.floor(num / 100);
    if (hundred) {
        words += numberToWords(hundred) + ' Hundred ';
        num %= 100;
    }

    // Handle Tens and Ones
    if (num < 20) {
        words += ones[num] + ' ';
    } else {
        const ten = Math.floor(num / 10);
        words += tens[ten] + ' ';
        const one = num % 10;
        if (one) {
            words += ones[one] + ' ';
        }
    }

    return words.trim();
}

// Function to load saved values from Chrome storage
function loadValues() {
    chrome.storage.sync.get(['investmentAmount', 'stopLossPercent', 'targetPercent'], (data) => {
        if (data.investmentAmount) {
            document.getElementById('investment').value = data.investmentAmount;
            updateInvestmentAmountInWords(data.investmentAmount); // Update in words
        }
        if (data.stopLossPercent) {
            document.getElementById('stoploss').value = data.stopLossPercent;
        }
        if (data.targetPercent) {
            document.getElementById('target').value = data.targetPercent;
        }

        // Trigger calculation to update the displayed results immediately
        calculateIfAllFilled();
    });
}

// Function to save values to Chrome storage
function saveValues() {
    const investmentAmount = document.getElementById('investment').value;
    const stopLossPercent = document.getElementById('stoploss').value;
    const targetPercent = document.getElementById('target').value;

    chrome.storage.sync.set({
        investmentAmount: investmentAmount,
        stopLossPercent: stopLossPercent,
        targetPercent: targetPercent
    });

    // Update investment amount in words
    updateInvestmentAmountInWords(investmentAmount);
}

// Function to update the displayed investment amount in words
function updateInvestmentAmountInWords(amount) {
    const investmentInWords = numberToWords(parseInt(amount, 10));
    document.getElementById('investment-amount').textContent = 'Investment ₹ '+investmentInWords;
}

// Function to check if all fields are filled and perform calculation
function calculateIfAllFilled() {
    const investmentInput = document.getElementById('investment').value;
    const priceInput = document.getElementById('price').value;
    const stopLossInput = document.getElementById('stoploss').value;
    const targetInput = document.getElementById('target').value;

    if (investmentInput && priceInput && stopLossInput && targetInput) {
        calculate();
    }
}

// Function to get the current tab title and stock price
function getCurrentTabInfo() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          const title = tabs[0].title.replace("Buy Sell Chart", "");

            document.getElementById('tab-title').textContent = title;

            // Check if the URL matches the TradingView URL
            if (tabs[0].url.includes('https://in.tradingview.com/')) {
                // Use regex to find the first number (stock price) after the first space
                const parts = title.split(' '); // Split title into parts
                const stockPrice = parts[1]; // The second part should be the stock price

                // Check if stock price is a valid number
                if (!isNaN(stockPrice.replace(/,/g, ''))) {
                    // Set the stock price in the input field (remove commas)
                    document.getElementById('price').value = stockPrice.replace(/,/g, '');
                }
            }
        }

        // Check if all fields are filled after loading tab info and perform calculation
        calculateIfAllFilled();
    });
}

// Calculation function
function calculate() {
    const investmentInput = document.getElementById('investment');
    const priceInput = document.getElementById('price');
    const stopLossInput = document.getElementById('stoploss');
    const targetInput = document.getElementById('target');
    const quantityOutput = document.getElementById('quantity');
    const stopLossPriceOutput = document.getElementById('stopLossPrice');
    const targetPriceOutput = document.getElementById('targetPrice');

    const investmentAmount = parseFloat(investmentInput.value) || 0;
    const stockPrice = parseFloat(priceInput.value) || 0;
    const stopLossPercent = parseFloat(stopLossInput.value) || 0;
    const targetPercent = parseFloat(targetInput.value) || 0;

    if (stockPrice > 0) {
        const quantity = investmentAmount / stockPrice;
        quantityOutput.textContent = quantity.toFixed(2);

        const stopLossPrice = stockPrice - (stockPrice * stopLossPercent / 100);
        stopLossPriceOutput.textContent = stopLossPrice.toFixed(2);

        const targetPrice = stockPrice + (stockPrice * targetPercent / 100);
        targetPriceOutput.textContent = targetPrice.toFixed(2);
    } else {
        quantityOutput.textContent = '';
        stopLossPriceOutput.textContent = '';
        targetPriceOutput.textContent = '';
    }

    // Update investment amount in words whenever calculation occurs
    updateInvestmentAmountInWords(investmentInput.value);

}

// Attach event listeners to input fields
function attachCalculationLogic() {
    const investmentInput = document.getElementById('investment');
    const priceInput = document.getElementById('price');
    const stopLossInput = document.getElementById('stoploss');
    const targetInput = document.getElementById('target');

    investmentInput.addEventListener('input', () => {
        saveValues(); // Save values on input change
        calculateIfAllFilled(); // Check if all fields are filled to calculate
    });

    priceInput.addEventListener('input', calculateIfAllFilled);
    stopLossInput.addEventListener('input', () => {
        saveValues(); // Save values on input change
        calculateIfAllFilled(); // Check if all fields are filled to calculate
    });
    
    targetInput.addEventListener('input', () => {
        saveValues(); // Save values on input change
        calculateIfAllFilled(); // Check if all fields are filled to calculate
    });

    // Load values from storage when the popup opens
    loadValues();

    // Get the current tab title and stock price when the popup opens
    getCurrentTabInfo();
}

// Call the function to attach calculation logic
attachCalculationLogic();

// ... (previous code remains the same)

// Function to update the displayed investment amount in words
function updateInvestmentAmountInWords(amount) {
    const investmentInWords = numberToWords(parseInt(amount, 10));
    document.getElementById('investment-amount').textContent = 'Investment ₹ '+investmentInWords;
}

// Function to calculate and display loss and profit amounts
function updateLossProfit() {
    const investmentAmount = parseFloat(document.getElementById('investment').value) || 0;
    const stopLossPercent = parseFloat(document.getElementById('stoploss').value) || 0;
    const targetPercent = parseFloat(document.getElementById('target').value) || 0;

    const lossAmount = (investmentAmount * stopLossPercent / 100).toFixed(2);
    const profitAmount = (investmentAmount * targetPercent / 100).toFixed(2);

    document.getElementById('loss-amount').textContent = `₹${lossAmount}`;
    document.getElementById('profit-amount').textContent = `₹${profitAmount}`;
}

// Function to check if all fields are filled and perform calculation
function calculateIfAllFilled() {
    const investmentInput = document.getElementById('investment').value;
    const priceInput = document.getElementById('price').value;
    const stopLossInput = document.getElementById('stoploss').value;
    const targetInput = document.getElementById('target').value;

    if (investmentInput && priceInput && stopLossInput && targetInput) {
        calculate();
        updateLossProfit();
    }
}



// Attach event listeners to input fields
function attachCalculationLogic() {
    const investmentInput = document.getElementById('investment');
    const priceInput = document.getElementById('price');
    const stopLossInput = document.getElementById('stoploss');
    const targetInput = document.getElementById('target');

    investmentInput.addEventListener('input', () => {
        saveValues();
        calculateIfAllFilled();
    });

    priceInput.addEventListener('input', calculateIfAllFilled);
    stopLossInput.addEventListener('input', () => {
        saveValues();
        calculateIfAllFilled();
    });
    
    targetInput.addEventListener('input', () => {
        saveValues();
        calculateIfAllFilled();
    });

    // Load values from storage when the popup opens
    loadValues();

    // Get the current tab title and stock price when the popup opens
    getCurrentTabInfo();
}

// Call the function to attach calculation logic
attachCalculationLogic();