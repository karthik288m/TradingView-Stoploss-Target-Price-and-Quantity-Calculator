// contentScript.js
function createFloatingCalculator() {
    const floatingExtension = document.createElement('div');
    floatingExtension.id = 'floating-extension';

    floatingExtension.innerHTML = `
        <div id="floating-extension-header">Intraday QTY,SL & TP</div>
        <label for="investment">Investment Amount</label>
        <input type="number" id="investment" placeholder="Enter investment amount">
        
        <label for="price">Stock Price</label>
        <input type="number" id="price" placeholder="Enter stock price">
        
        <label for="stoploss">Stop-Loss %</label>
        <input type="number" id="stoploss" value="5">
        
        <label for="target">Target %</label>
        <input type="number" id="target" value="10">
        
        <div class="result">
            <p>Quantity: <span id="quantity"></span></p>
            <p>Stop-Loss Price: <span id="stopLossPrice"></span></p>
            <p>Target Price: <span id="targetPrice"></span></p>
        </div>
    `;

    document.body.appendChild(floatingExtension);

    // Load the floating logic
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('floatingLogic.js');
    document.body.appendChild(script);
}

document.addEventListener('DOMContentLoaded', createFloatingCalculator);
