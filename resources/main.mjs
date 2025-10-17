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

INPUT.onkeyup = e => {
    if (
        INPUT.value.trim() != '' && (e.key == 'Enter' || e.keyCode == 13)) {
        let userInput = INPUT.value.split(' ');    
        
        let cmd = new Command(userInput.shift(), ...userInput);
        window.dbg = cmd;
        
        appendToHistory(`> ${INPUT.value}`);
        if (cmd.clearRequired) clearHistory();
        if (cmd.results) appendToHistory(cmd.results);
        appendToHistory(' ');

        INPUT.value = '';
        INPUT_REPEATER.innerText = '';
    }
}

function appendToHistory(value, doParsing = false) {
    if (!doParsing) console.log(value)

    let container = document.createElement('div');

    if (value instanceof HTMLElement) container.appendChild(value);
    else container.innerHTML = value;

    if (!doParsing) {
        window.cmdHistory.push(container.innerHTML);
        encodeHistory(window.cmdHistory);
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