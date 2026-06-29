// script.js
(function() {
    "use strict";

    const CONFIG_LUHN = Object.freeze({
        modulo: 10,
        limiteDigito: 9,
        factorMultiplicador: 2
    });

    // --- LÓGICA DEL GENERADOR ENCAPSULADA ---
    function calcularLuhn() {
        const rawInput = document.getElementById('accountNumber').value;
        const cleanInput = rawInput.replace(/\D/g, ''); 
        
        if (!cleanInput) return;

        const digits = cleanInput.split('').map(Number);
        const row1 = document.getElementById('rowStep1');
        const row2 = document.getElementById('rowStep2');
        const row3 = document.getElementById('rowStep3');

        row1.innerHTML = '<td class="label-cell">1. Digitos del número de cuenta:</td>';
        row2.innerHTML = '<td class="label-cell">2. Duplicar dígitos pares:</td>';
        row3.innerHTML = '<td class="label-cell">3. Sumar los dígitos:</td>';

        let sumTotal = 0;
        const processedData = [];

        for (let i = digits.length - 1, count = 0; i >= 0; i--, count++) {
            let original = digits[i];
            let duplicated = original;
            let textSum = `${original}`;
            let isEvenPos = (count % 2 === 0);

            if (isEvenPos) {
                duplicated = original * CONFIG_LUHN.factorMultiplicador;
                if (duplicated > CONFIG_LUHN.limiteDigito) {
                    textSum = `${Math.floor(duplicated / 10)}+${duplicated % 10}`;
                    sumTotal += Math.floor(duplicated / 10) + (duplicated % 10);
                } else {
                    textSum = `${duplicated}`;
                    sumTotal += duplicated;
                }
            } else {
                sumTotal += original;
            }

            processedData.unshift({ original, duplicated, textSum, isEvenPos });
        }

        processedData.forEach(item => {
            const bgClass = item.isEvenPos ? 'bg-yellow' : 'bg-blue';
            row1.innerHTML += `<td class="data-cell bg-blue">${item.original}</td>`;
            row2.innerHTML += `<td class="data-cell ${bgClass}">${item.duplicated}</td>`;
            row3.innerHTML += `<td class="data-cell bg-blue">${item.textSum}</td>`;
        });

        row1.innerHTML += `<td class="data-cell bg-green">X</td>`;
        row2.innerHTML += `<td class="data-cell bg-green">X</td>`;
        row3.innerHTML += `<td class="data-cell bg-green text-bold">=${sumTotal}</td>`;

        const unitsDigit = sumTotal % CONFIG_LUHN.modulo;
        const checkDigit = unitsDigit === 0 ? 0 : CONFIG_LUHN.modulo - unitsDigit;

        document.getElementById('finalDigit').textContent = checkDigit;
    }

    // --- LÓGICA DEL VALIDADOR ENCAPSULADA ---
    function validarLuhn() {
        const rawInput = document.getElementById('validateInput').value;
        const cleanInput = rawInput.replace(/\D/g, ''); 
        const badge = document.getElementById('validationResult');

        if (!cleanInput || cleanInput.length < 2) {
            badge.innerHTML = `<div>Por favor, ingrese un número válido completo.</div>`;
            badge.className = "validation-badge alert-error";
            badge.classList.remove('hidden');
            return;
        }

        const bodyNumbers = cleanInput.slice(0, -1);
        const originalCheckDigit = parseInt(cleanInput.slice(-1), CONFIG_LUHN.modulo);

        const digitsForGen = bodyNumbers.split('').map(Number);
        let sumGen = 0;
        
        for (let i = digitsForGen.length - 1, count = 0; i >= 0; i--, count++) {
            let d = digitsForGen[i];
            if (count % 2 === 0) {
                d *= CONFIG_LUHN.factorMultiplicador;
                if (d > CONFIG_LUHN.limiteDigito) d = Math.floor(d / 10) + (d % 10);
            }
            sumGen += d;
        }
        const unitsDigit = sumGen % CONFIG_LUHN.modulo;
        const correctCheckDigit = unitsDigit === 0 ? 0 : CONFIG_LUHN.modulo - unitsDigit;

        const fullDigits = cleanInput.split('').map(Number);
        let totalSum = 0;
        const len = fullDigits.length;

        for (let i = len - 1; i >= 0; i--) {
            let d = fullDigits[i];
            if ((len - 1 - i) % 2 === 1) {
                d *= CONFIG_LUHN.factorMultiplicador;
                if (d > CONFIG_LUHN.limiteDigito) d -= CONFIG_LUHN.limiteDigito;
            }
            totalSum += d;
        }

        if (totalSum % CONFIG_LUHN.modulo === 0) {
            badge.innerHTML = `
                <div class="badge-title">✓ NÚMERO VÁLIDO</div>
                <div class="comparison-box">
                    <p>El número estructurado cumple perfectamente con el algoritmo de Luhn.</p>
                    <div class="comp-row"><span class="comp-label">Número Ingresado:</span> <span class="text-valid">${cleanInput}</span></div>
                </div>
            `;
            badge.className = "validation-badge alert-success";
        } else {
            const correctFullNumber = bodyNumbers + correctCheckDigit;

            badge.innerHTML = `
                <div class="badge-title">✗ ESTRUCTURA INCORRECTA</div>
                <div class="comparison-box">
                    <div class="comp-row">
                        <span class="comp-label">Número Incorrecto:</span> 
                        <span class="text-invalid">${cleanInput}</span>
                    </div>
                    <div class="comp-row">
                        <span class="comp-label">Número Corregido:</span> 
                        <span class="text-corrected">${correctFullNumber}</span>
                    </div>
                    <div class="digit-diff">
                        El dígito proporcionado fue <span class="text-invalid">${originalCheckDigit}</span>, pero el algoritmo requiere que sea <span class="text-corrected">${correctCheckDigit}</span>.
                    </div>
                </div>
            `;
            badge.className = "validation-badge alert-error";
        }
        
        badge.classList.remove('hidden');
    }

    document.getElementById('btnGenerate').addEventListener('click', calcularLuhn);
    document.getElementById('btnValidate').addEventListener('click', validarLuhn);
    window.addEventListener('load', calcularLuhn);

})();