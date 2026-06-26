let currentExpression = "";
let selectedBaseNType = "DEC";
let previousBaseNType = "DEC"; 
let keyboardBuffer = "";

function pressKey(value) {
    let safeValue = value.toLowerCase();
    currentExpression += safeValue;
    document.getElementById("screenInput").innerText = currentExpression;
}

function clearScreen() {
    currentExpression = currentExpression.slice(0, -1);
    document.getElementById("screenInput").innerText = currentExpression || "";
    keyboardBuffer = "";
}
function resetCalculator() {
    currentExpression = "";
    keyboardBuffer = "";

    document.getElementById("screenInput").innerText = "";
    document.getElementById("screenResult").innerText = "0";

    const aiBox = document.getElementById("aiResponse");
    if (aiBox) aiBox.innerText = "";

    switchMode();
}

function balanceParentheses(expr) {
    let openCount = (expr.match(/\(/g) || []).length;
    let closeCount = (expr.match(/\)/g) || []).length;
    while (openCount > closeCount) {
        expr += ")";
        closeCount++;
    }
    return expr;
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute("data-theme");
    if (currentTheme === "light") {
        document.body.removeAttribute("data-theme");
    } else {
        document.body.setAttribute("data-theme", "light");
    }
}

// --- FIXED DYNAMIC ROUTING & EVENT HOOKS FOR DIMENSIONS ---
function switchMode() {
    const activeMode = document.getElementById("modeSelect").value;
    document.getElementById("screenModeIndicator").innerText = activeMode;
    
    const workspace = document.getElementById("dynamicWorkspace");
    const baseBtn = document.getElementById("baseBtn");
    const bracketRight = document.getElementById("bracketRight");
    
    workspace.innerHTML = "";
    if (baseBtn) baseBtn.style.display = "none";
    if (bracketRight) bracketRight.style.display = "block";

    if (activeMode === "EQN") {
        workspace.innerHTML = `
            <div><strong>Quadratic Formula Coeffs:</strong></div>
            <div class="coeff-grid" style="grid-template-columns: repeat(3, 1fr); gap: 5px; margin-top: 5px;">
                <input type="number" id="coeffA" placeholder="a" value="1">
                <input type="number" id="coeffB" placeholder="b" value="-5">
                <input type="number" id="coeffC" placeholder="c" value="6">
            </div>`;
    } 
    else if (activeMode === "MATRIX") {
        // Fallback to size 2 default if not instantiated yet
        let size = 2; 
        let op = "MUL"; 

        let htmlContent = `
            <div id="matrixControlPanel" style="display:flex; gap:8px; margin-bottom:12px;">
                <div style="flex:1;">
                    <strong style="margin-bottom:4px; display:block;">Dimension:</strong>
                    <select id="matrixSize" onchange="triggerGridRebuild()" style="width:100%; padding:6px; background:#161920; color:#fff; border:1px solid var(--calc-border); border-radius:8px; font-weight:600; outline:none; cursor:pointer;">
                        <option value="2">2 x 2 Grid</option>
                        <option value="3">3 x 3 Grid</option>
                    </select>
                </div>
                <div style="flex:1;">
                    <strong style="margin-bottom:4px; display:block;">Operation:</strong>
                    <select id="matrixOp" onchange="triggerGridRebuild()" style="width:100%; padding:6px; background:#161920; color:#fff; border:1px solid var(--calc-border); border-radius:8px; font-weight:600; outline:none; cursor:pointer;">
                        <option value="MUL">A × B (Multiply)</option>
                        <option value="DET">DET (Determinant)</option>
                        <option value="INV">INV (Inverse)</option>
                    </select>
                </div>
            </div>
            <div id="matrixGridsContainer"></div>
        `;

        workspace.innerHTML = htmlContent;

        // Shared dynamic rebuild function to keep context alive
        window.triggerGridRebuild = function() {
            const currentSize = parseInt(document.getElementById("matrixSize").value, 10);
            const currentOp = document.getElementById("matrixOp").value;
            const container = document.getElementById("matrixGridsContainer");
            
            if (!container) return;

            let gridHtml = ``;
            
            // Generate Matrix A Inputs
            gridHtml += `<div style="margin-bottom:6px; font-weight:bold; font-size:0.75rem; text-transform:uppercase; color:#8b949e;">Matrix A:</div>`;
            gridHtml += `<div class="matrix-grid" style="grid-template-columns: repeat(${currentSize}, 1fr); margin-bottom:14px; display:grid; gap:8px;">`;
            for (let i = 0; i < currentSize; i++) {
                for (let j = 0; j < currentSize; j++) {
                    let defaultValue = (i === j) ? 1 : 0;
                    gridHtml += `<input type="number" id="m_a${i}${j}" value="${defaultValue}" step="any" style="width:100%; text-align:center; padding:8px; border-radius:8px; background:#161920; color:#fff; border:1px solid var(--calc-border); font-weight:600; outline:none;">`;
                }
            }
            gridHtml += `</div>`;

            // Condition Matrix B Layout Container
            const displayStyle = (currentOp === "MUL") ? "block" : "none";
            gridHtml += `<div id="matrixBContainer" style="display: ${displayStyle};">`;
            gridHtml += `<div style="margin-bottom:6px; font-weight:bold; font-size:0.75rem; text-transform:uppercase; color:#8b949e;">Matrix B:</div>`;
            gridHtml += `<div class="matrix-grid" style="grid-template-columns: repeat(${currentSize}, 1fr); margin-bottom:4px; display:grid; gap:8px;">`;
            for (let i = 0; i < currentSize; i++) {
                for (let j = 0; j < currentSize; j++) {
                    let defaultValue = (i === j) ? 1 : 0;
                    gridHtml += `<input type="number" id="m_b${i}${j}" value="${defaultValue}" step="any" style="width:100%; text-align:center; padding:8px; border-radius:8px; background:#161920; color:#fff; border:1px solid var(--calc-border); font-weight:600; outline:none;">`;
                }
            }
            gridHtml += `</div></div>`;

            container.innerHTML = gridHtml;
        };

        // Render initial default grid view
        triggerGridRebuild();
    }
    else if (activeMode === "VECTOR") {
        workspace.innerHTML = `
            <div><strong>Vectors (3D Layout):</strong></div>
            <div class="vector-grid" style="grid-template-columns: repeat(3, 1fr);">
                <input type="number" id="v_a1" value="1"> <input type="number" id="v_a2" value="2"> <input type="number" id="v_a3" value="3">
                <input type="number" id="v_b1" value="4"> <input type="number" id="v_b2" value="5"> <input type="number" id="v_b3" value="6">
            </div>
            <select id="vectorOp" style="color:#fff; background:#222; border-radius:4px; padding:4px; margin-top:5px;">
                <option value="DOT">Dot Product</option>
                <option value="CROSS">Cross Product</option>
            </select>`;
    }
    else if (activeMode === "BASE_N") {
        workspace.innerHTML = `
            <div><strong>Base-N Expression Entry:</strong></div>
            <input type="text" id="baseNInput" placeholder="Enter Base Value" style="width:100%; margin-top:5px; background:#222; color:#fff; border:1px solid #444; padding:4px; border-radius:4px;">`;
        
        if (baseBtn) baseBtn.style.display = "block";
        if (bracketRight) bracketRight.style.display = "none";
        setBaseN(selectedBaseNType);
    }
}

function setBaseN(baseType) {
    previousBaseNType = selectedBaseNType;
    selectedBaseNType = baseType.toUpperCase();
    
    const subIndicator = document.getElementById("screenBaseIndicator");
    if (subIndicator) subIndicator.innerText = selectedBaseNType;
    
    const buttons = { 'DEC': 'decBtn', 'HEX': 'hexBtn', 'BIN': 'binBtn', 'OCT': 'octBtn' };
    Object.keys(buttons).forEach(key => {
        const btnElement = document.getElementById(buttons[key]);
        if (btnElement) {
            if (key === selectedBaseNType) {
                btnElement.style.border = "1px solid #00ff00";
                btnElement.style.background = "#333";
            } else {
                btnElement.style.border = "none";
                btnElement.style.background = "";
            }
        }
    });

    const inputField = document.getElementById("baseNInput");
    if (currentExpression || (inputField && inputField.value)) {
        triggerCalculation(true);
    }
}

async function triggerCalculation(isConversion = false) {
    const mode = document.getElementById("modeSelect").value;
    let payload = { mode: mode };

    if (mode === "COMP" || mode === "CMPLX") {
        if (!currentExpression) return;
        let validatedExpression = balanceParentheses(currentExpression);
        payload.expression = validatedExpression;
        if (mode === "COMP") payload.angle_unit = "DEG"; 
    } 
    else if (mode === "BASE_N") {
        const inputField = document.getElementById("baseNInput");
        let baseExpression = (inputField && inputField.value) ? inputField.value : currentExpression;
        if (!baseExpression) return;
        payload.expression = baseExpression;
        payload.base = isConversion ? previousBaseNType : selectedBaseNType;
    }
    else if (mode === "EQN") {
        payload.config_type = "DEGREE_2";
        const rawA = document.getElementById("coeffA").value.toString().trim();
        const rawB = document.getElementById("coeffB").value.toString().trim();
        const rawC = document.getElementById("coeffC").value.toString().trim();
        payload.coefficients = [parseFloat(rawA) || 0, parseFloat(rawB) || 0, parseFloat(rawC) || 0];
    }
    else if (mode === "MATRIX") {
        const size = parseInt(document.getElementById("matrixSize").value, 10);
        const op = document.getElementById("matrixOp").value;
        
        let matrixA = [];
        let matrixB = [];

        // Scrape calculations based on the EXACT selection dimension loop rules
        for (let i = 0; i < size; i++) {
            let rowA = [];
            let rowB = [];
            for (let j = 0; j < size; j++) {
                const elementA = document.getElementById(`m_a${i}${j}`);
                rowA.push(elementA ? (parseFloat(elementA.value) || 0) : 0);
                
                const elementB = document.getElementById(`m_b${i}${j}`);
                rowB.push(elementB ? (parseFloat(elementB.value) || 0) : 0);
            }
            matrixA.push(rowA);
            matrixB.push(rowB);
        }

        payload.matrix_a = matrixA;
        payload.matrix_b = matrixB;
        payload.operation = op;
    }
    else if (mode === "VECTOR") {
        payload.vector_a = [
            parseFloat(document.getElementById("v_a1").value) || 0,
            parseFloat(document.getElementById("v_a2").value) || 0,
            parseFloat(document.getElementById("v_a3").value) || 0
        ];
        payload.vector_b = [
            parseFloat(document.getElementById("v_b1").value) || 0,
            parseFloat(document.getElementById("v_b2").value) || 0,
            parseFloat(document.getElementById("v_b3").value) || 0
        ];
        payload.operation = document.getElementById("vectorOp").value;
    }

    try {
        document.getElementById("screenResult").innerText = "CALC...";

const aiStatus = document.getElementById("aiStatus");

if (aiStatus) {
    aiStatus.innerText = "Processing...";
}
        
        const response = await fetch("/api/991ms/calculate", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

     if (data.success) {

    let finalOutput = data.result;

    if (typeof finalOutput === 'object') {
        finalOutput = JSON.stringify(finalOutput);
    }

    document.getElementById("screenResult").innerText = finalOutput;

    const aiStatus = document.getElementById("aiStatus");
    const aiResponse = document.getElementById("aiResponse");

    if (data.ai_type) {

        if (aiStatus) {
            aiStatus.innerText = "AI Active";
        }

        if (aiResponse) {

            let featureName = "";

            switch(data.ai_type){

                case "equation":
                    featureName = "Equation Interpreter";
                    break;

                case "engineering":
                    featureName = "Engineering Assistant";
                    break;

                case "conversion":
                    featureName = "Smart Unit Conversion";
                    break;

                case "finance":
                    featureName = "Natural Language Calculator";
                    break;

                case "geometry":
                    featureName = "Natural Language Calculator";
                    break;

                case "formula":
                    featureName = "Formula Explainer";
                    break;

                default:
                    featureName = "AI Engine";
            }

            aiResponse.innerText =
                "AI Feature: " + featureName;
        }

    } else {

        if (aiStatus) {
            aiStatus.innerText = "Calculator Mode";
        }

        if (aiResponse) {
            aiResponse.innerText = "";
        }
    }
            if (mode === "BASE_N" && isConversion) {
                let decimalInt = parseInt(finalOutput, 10);
                if (selectedBaseNType === "HEX") finalOutput = decimalInt.toString(16).toUpperCase();
                else if (selectedBaseNType === "BIN") finalOutput = decimalInt.toString(2);
                else if (selectedBaseNType === "OCT") finalOutput = decimalInt.toString(8);
                else finalOutput = decimalInt.toString(10);
            }
            
            document.getElementById("screenResult").innerText = finalOutput;
            
            if (mode === "COMP" || mode === "CMPLX" || mode === "BASE_N") {
                document.getElementById("screenInput").innerText = "";
                currentExpression = finalOutput.toString(); 
                const inputField = document.getElementById("baseNInput");
                if (inputField && mode === "BASE_N") {
                    inputField.value = finalOutput.toString();
                }
            }
        } else {
            document.getElementById("screenResult").innerText = "SYN ERROR";
        }
    } catch (err) {
        document.getElementById("screenResult").innerText = "CONN ERROR";
        console.error(err);
    }
}

// Global Hardware Keyboard Event Rules Handler
document.addEventListener('keydown', function(event) {
    // If the user is typing inside an input grid or dropdown field, let the default behavior happen
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') return;

    const key = event.key;
    const mode = document.getElementById("modeSelect").value;

    // 1. FIX: Allow copy/paste commands (Ctrl+V or Cmd+V) to pass through naturally
    if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === 'v') {
        // Let the system execute the paste event; handled by the custom paste event listener below
        return; 
    }

    // 2. FIX: Explicitly permit typing 'i' for CMPLX mode expressions
    if (key.toLowerCase() === 'i') {
        event.preventDefault();
        pressKey('i');
        return;
    }

    if (mode === "BASE_N" && /[a-fA-F]/.test(key) && key.length === 1) {
        event.preventDefault();
        pressKey(key);
    }
    else if (/[0-9]/.test(key) || ['+', '-', '*', '/', '.', ')', '(', '^'].includes(key)) {
        event.preventDefault();
        keyboardBuffer = "";
        pressKey(key);
    } 
    else if (/[a-zA-Z]/.test(key) && key.length === 1) {
        event.preventDefault();
        keyboardBuffer += key.toLowerCase();
    }
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        triggerCalculation(); 
    } else if (key === 'Backspace') {
        event.preventDefault();
        clearScreen();
    } else if (key === 'Escape') {
        event.preventDefault();
        resetCalculator();
    }
});

// 3. FIX: Global Paste Event Listener to capture copied equations directly into the calculator screen
document.addEventListener('paste', function(event) {
    // Skip if writing directly into matrix/equation elements
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') return;

    event.preventDefault();
    
    // Grab the text value from the clipboard buffer data map
    let pastedData = (event.clipboardData || window.clipboardData).getData('text');
    
    if (pastedData) {
        // Clean up formatting issues, convert to lowercase, and strip trailing spaces/newlines
        let cleanPaste = pastedData.replace(/\s+/g, '').toLowerCase();
        
        // Append it cleanly onto the active visual workflow tracking state
        currentExpression += cleanPaste;
        document.getElementById("screenInput").innerText = currentExpression;
    }
});
window.onload = switchMode;