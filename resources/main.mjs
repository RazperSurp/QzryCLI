import Command from './modules/commands.mjs';

const INPUT = document.querySelector('#input > input');
const INPUT_REPEATER = document.getElementById('input-repeater');
const HISTORY = document.getElementById('history');
const PATH_CONTAINER = document.getElementById('path');
const HOME_PATH = 'root\\users\\main';

window.cmdHistory = parseHistory() ?? [];
window.currPath = HOME_PATH;


document.body.onclick = e => { INPUT.focus() }
INPUT.oninput = e => {
    INPUT_REPEATER.innerText = '';
    INPUT.value.split('').forEach(letter => { INPUT_REPEATER.innerHTML += `<span>${letter}</span>` });
}

INPUT.onkeyup = async e => {
    if (INPUT.value.trim() != '' && (e.key == 'Enter' || e.keyCode == 13)) {
        let userInput = INPUT.value.split(' ');    
        
        let cmd = new Command(window.currPath, userInput.shift(), ...userInput);

        await appendToHistory(`${currPath()}> ${INPUT.value}`);

        
        await appendToHistory(cmd.execute(), false, cmd);


        await appendToHistory(' ');

        INPUT.value = '';
        INPUT_REPEATER.innerText = '';
    }
}

function currPath() {
    return window.currPath.replace(HOME_PATH, '~');
}

async function appendToHistory(value, doParsing = false, cmd = null) {
        console.log(value);
    if (!doParsing) console.log(value)

    let container = document.createElement('div');

    if (value instanceof Promise && cmd !== null) {
        container.classList.add('waiting');
        value.then(results => {
            results = results || 'Success';

            container.classList.remove('waiting');

            if (results instanceof HTMLElement) container.appendChild(results);
            else container.innerHTML = results;
            
            window.cmdHistory.push(container.innerHTML);
            encodeHistory(window.cmdHistory);
            
            console.log([cmd, cmd.moveTo, window.currPath]);
            if (cmd.clearRequired) clearHistory();
            if (cmd.moveTo) {
                console.log(cmd.moveTo);
                window.currPath = cmd.moveTo;
                PATH_CONTAINER.innerText = currPath();
            }
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