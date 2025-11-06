import Application from './modules/Application.mjs';
import Command from './modules/Command.mjs';
import Directory from './modules/Directory.mjs';

const INPUT = document.querySelector('#input > input');
const INPUT_REPEATER = document.getElementById('input-repeater');

window.Application = new Application('guest');
window.Directory = Directory;

INPUT.focus();
document.body.onclick = e => { INPUT.focus() }
INPUT.oninput = e => {
    if (window.Application.state != window.Application.STATES.LOCKED) {
        INPUT_REPEATER.innerText = '';
        INPUT.value.split('').forEach(letter => { INPUT_REPEATER.innerHTML += `<span>${letter}</span>` });
    } else INPUT.value = '';
}

INPUT.onkeyup = async e => {
    if (window.Application.state != window.Application.STATES.LOCKED) {
        if (e.keyCode !== 38 && e.keyCode !== 40) {
            window.Application.historyPos = -1;    
            if (INPUT.value.trim() != '' && (e.key == 'Enter' || e.keyCode == 13)) {
                window.Application.process(...INPUT.value.split(' '));

                INPUT.value = '';
                INPUT_REPEATER.innerText = '';
            }
        } else {
            // wip...

            // window.Application.historyPos += e.keyCode == 38 ? 1 : -1;
            // if (window.Application.historyPos < -1) window.Application.historyPos = -1;
            // else if (window.Application.historyPos > window.Application.processes.length - 1) window.Application.historyPos = window.Application.processes.length - 1;

            // if (window.Application.historyProcess !== undefined) {
            //     INPUT.value = window.Application.historyProcess.raw;
            //     INPUT_REPEATER.innerText = window.Application.historyProcess.raw;
            // } else {
            //     INPUT.value = '';
            //     INPUT_REPEATER.innerText = '';
            // }
        } 
    } else {
        INPUT.value = '';
        if (typeof window.Application.__locker.processKeyup == 'function') window.Application.__locker.processKeyup(e);
    }
}