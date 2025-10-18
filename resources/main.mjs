import Command from './modules/commands.mjs';

const INPUT_REPEATER = document.getElementById('input-repeater');
const INPUT = document.querySelector('#input > input');
const HISTORY = document.getElementById('history');

window.cmdHistory = parseHistory() ?? [];

document.body.onclick = e => { INPUT.focus() }
INPUT.oninput = e => {
    INPUT_REPEATER.innerText = '';
    INPUT.value.split('').forEach(letter => { INPUT_REPEATER.innerHTML += `<span>${letter}</span>` });
}

INPUT.onkeyup = async e => {
    if (INPUT.value.trim() != '' && (e.key == 'Enter' || e.keyCode == 13)) {
        let userInput = INPUT.value.split(' ');    
        
        let cmd = new Command(userInput.shift(), ...userInput);

        appendToHistory(`> ${INPUT.value}`);
        if (cmd.clearRequired) clearHistory();
        appendToHistory(cmd.execute());
        appendToHistory(' ');

        INPUT.value = '';
        INPUT_REPEATER.innerText = '';
    }
}

function appendToHistory(value, doParsing = false) {
        console.log(value);
    if (!doParsing) console.log(value)

    let container = document.createElement('div');

    if (value instanceof Promise) {
        container.classList.add('waiting');
        value.then(results => {
            results = results || 'Success';

            container.classList.remove('waiting');
            
            if (results instanceof HTMLElement) container.appendChild(results);
            else container.innerHTML = results;
            
            window.cmdHistory.push(container.innerHTML);
            encodeHistory(window.cmdHistory);
        })
    } else {
        if (value instanceof HTMLElement) container.appendChild(value);
        else container.innerHTML = value;
        
        if (!doParsing) {
            window.cmdHistory.push(container.innerHTML);
            encodeHistory(window.cmdHistory);
        }
    }


    HISTORY.appendChild(container);
}

function parseHistory() {
    let results = window.sessionStorage.getItem('history') ? JSON.parse(String(window.sessionStorage.getItem('history')).replace(/&gt;/g, '>')) : [];

    if (results.length) results.forEach(el => { appendToHistory(el, true) });

    return results;
}

function encodeHistory() {
    window.sessionStorage.setItem('history', JSON.stringify(window.cmdHistory));
}

function clearHistory() {
    window.cmdHistory = [];
    window.sessionStorage.removeItem('history')
    
    HISTORY.innerHTML = '';
}