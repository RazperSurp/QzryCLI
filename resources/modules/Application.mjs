import Command from "./Command.mjs";
import { config } from "./config.mjs";
import Directory from "./Directory.mjs";
import User from "./User.mjs";

export default class Application {
    __currentPath;
    __currentDir;
    user;
    command;
    directories;

    state = 0;
    processes = [];

    get STATES() { return { WAITING: 0, PROCESSING: 1, LOCKED: 2 } }

    containers = {
        history: document.querySelector('#history'),
        path: document.querySelector('#path')
    };

    history = [];

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
        console.log(this.currentDir);
    }

    async process(...input) {
        if (this.state != this.STATES.PROCESSING) {
            this.state = this.STATES.PROCESSING;

            this.__echo(`${this.user.username}@QzryCLI: ${this.currentPath}> ${input.join(' ')}`)
            this.command = new Command(input.shift(), ...input);

            this.processes.push({ command: this.command, results: null });

            let loader = this.__echo('');
            loader.classList.add('waiting');

            let results = await this.command.execute();
            this.processes[this.processes.length - 1].results = results.status == 'error' ? results : { status: 'success', content: results };

            if (this.processes[this.processes.length - 1].results && this.processes[this.processes.length - 1].results.status == 'error') {
                this.__handleError(this.processes[this.processes.length - 1].results.name, this.processes[this.processes.length - 1].results.code, this.processes[this.processes.length - 1].results.msg, loader);
            } else {
                loader.classList.remove('waiting');
                this.__echo(this.processes[this.processes.length - 1].results, null, loader);
            }
            
            this.state = this.STATES.WAITING;
        } else {
            console.warn('Unable to process another interaction until previous is still running:');
            console.warn(this.processes[this.processes.length - 1])
        }
    }

    __handleError(name, code, msg = null, element = null) {
        console.log(arguments);

        let error =`${code}/${name}: ${msg ?? 'Undefined exception'}`;
        this.__echo(`<ERROR> ERR_${error}`, { color: 'red' }, element);
        element.classList.remove('waiting');
        console.error(error);
    } 

    __parseHistory() {
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

    __echo(msg, style, element = null) {
        element = element ?? document.createElement('span');
        Object.assign(element.style, style);

        if (element === null) element.innerHTML = msg;
        else element.innerHTML = msg;

        this.containers.history.appendChild(element);

        return element;
    }
}