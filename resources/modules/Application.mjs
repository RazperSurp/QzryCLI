import Mineswepper from "../games/Mineswepper.mjs";
import Command from "./Command.mjs";
import { config } from "./config.mjs";
import Directory from "./Directory.mjs";
import User from "./User.mjs";

export default class Application {
    __currentPath;
    __currentDir;
    __locker;
    __state = 0;

    user;
    command;
    directories;

    processes = [];
    history = [];

    containers = {
        history: document.querySelector('#history'),
        path: document.querySelector('#path')
    };

    get STATES() { return { WAITING: 0, PROCESSING: 1, LOCKED: 2 } }

    get state() { return this.__state; }
    set state(value) {
        this.__state = value;
        switch(this.__state) {
            case this.STATES.LOCKED:
                window.Application.containers.path.parentNode.parentNode.style.opacity = '0';
                break;
            default:
                window.Application.containers.path.parentNode.parentNode.style.opacity = '1';
                break;
        }
    }

    get currentPath() { return this.__currentPath.replace(this.user.homePath, '~') }

    set currentDir(directory) {
        this.__currentDir = directory;
        this.__currentPath = directory.stringify();
        this.containers.path.innerText = this.currentPath;
    }

    constructor (user = null, password = null) {
        this.user = User.login(user ?? 'guest', password);
        if (!(this.user instanceof User)) this.__handleError('INVALID_CREDENTIALS');

        this.__echo(`<log> Вход выполнен: ${this.user.firstname} </log>`);
        document.querySelector('#user').innerText = `${this.user.username}@QzryCLI:`;
        
        this.directories = Directory.parse();
        this.currentDir = Directory.findByPath(this.user.homePath);
    }

    async process(...input) {
        if (this.state != this.STATES.PROCESSING) {
            this.state = this.STATES.PROCESSING;

            this.__echo(`${this.user.username}@QzryCLI: ${this.currentPath}> ${input.join(' ')}`)
            this.command = new Command(input.shift(), ...input);

            this.processes.push({ command: this.command, results: null });

            let loader = this.__echo('');
            loader.classList.add('waiting');

            const echoData = (results) => {
                console.log(results);
                if (results && results.status == 'error') {
                    this.__handleError(results.name, results.code, results.msg, loader);
                } else {
                    loader.classList.remove('waiting');
                    if (results) this.__echo(results.content, null, loader);
                }
            }

            let results = await this.command.execute();
            switch (results.status) {
                case 'error': 
                    this.processes[this.processes.length - 1].results = results;
                    echoData(this.processes[this.processes.length - 1].results);
                    break;
                case 'lock':
                    this.processes[this.processes.length - 1].results = results;
                    this.__handleLocker();
                    echoData();
                    break;
                default: 
                    this.processes[this.processes.length - 1].results = { status: 'success', content: results };
                    echoData(this.processes[this.processes.length - 1].results);
                    break;
            }
            
            this.state = this.state == this.STATES.PROCESSING ? this.STATES.WAITING : this.STATES.LOCKED;
        } else {
            console.warn('Unable to process another interaction until previous is still running:');
            console.warn(this.processes[this.processes.length - 1])
        }
    }

    __handleError(name, code, msg = null, element = null) {
        let error =`${code}/${name}: ${msg ?? 'Undefined exception'}`;
        this.__echo(`<ERROR> ERR_${error}`, { color: 'red' }, element);
        element.classList.remove('waiting');
        console.error(error);
    } 

    __parseHistory() {
        console.log(window.sessionStorage.getItem('history'))

        this.history = JSON.parse(window.sessionStorage.getItem('history')) ?? [];
        for (line of this.history) this.__appendToHistory(line, null, true);
    }

    __encodeHistory() {
        window.sessionStorage.setItem('history', JSON.stringify(this.history));
    }

    __appendToHistory(line, style = null, doParsing = false) {
        if (!doParsing) {
            this.history.push(line);
            this.__encodeHistory();
        }
        
        this.__echo(line, style);
    }

    __handleLocker() {
        this.state = this.STATES.LOCKED;
        let objParams = this.processes[this.processes.length - 1].results.params ? this.processes[this.processes.length - 1].results.params : null;

        switch (this.processes[this.processes.length - 1].results.class) {
            case 'Mineswepper':
                this.__locker = new Mineswepper(...this.processes[this.processes.length - 1].results.params);
                this.__locker.start();

                break;
        }
    }

    onkeyup(e) {
    }

    __echo(msg, style, element = null) {
        element = element ?? document.createElement('span');
        Object.assign(element.style, style);

        if (element === null) element.innerHTML = msg;
        else element.innerHTML = msg;

        this.containers.history.appendChild(element);

        return element;
    }
}