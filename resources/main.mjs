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
    INPUT_REPEATER.innerText = '';
    INPUT.value.split('').forEach(letter => { INPUT_REPEATER.innerHTML += `<span>${letter}</span>` });
}

INPUT.onkeyup = async e => {
    if (INPUT.value.trim() != '' && (e.key == 'Enter' || e.keyCode == 13)) {
        window.Application.process(...INPUT.value.split(' '));

        INPUT.value = '';
        INPUT_REPEATER.innerText = '';
    }
}