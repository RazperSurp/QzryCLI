import Command from "./Command.mjs";
import { config } from "./config.mjs";
import User from "./User.mjs";

export default class Application {
    __currentPath;
    user;
    command;

    containers = {
        history: document.querySelector('#history'),
        path: document.querySelector('#path')
    };

    history = [];

    get currentPath() { return this.__currentPath.replace(this.user.homePath, '~') }

    constructor (user = null, password = null) {
        this.user = User.login(user ?? 'guest', password);
        if (!(this.user instanceof User)) this.__handleError('INVALID_CREDENTIALS');

        this.__echo(`Logged as ${this.user.firstname}`, { color: 'gray' });
        document.querySelector('#user').innerText = `${this.user.username}@QzryCLI:`;
        
        this.__currentPath = this.user.homePath;
    }

    async process(...input) {
        this.__echo(`${this.user.username}@QzryCLI: ${this.currentPath}> ${input.join(' ')}`)
        this.command = new Command(input.shift(), input);

        let loader = this.__echo('');
        loader.classList.add('waiting');

        let results = await this.command.execute();

        if (results && results.status == 'error') this.__handleError(results.name, results.msg, loader);
        else {
            loader.classList.remove('waiting');
            this.__echo(results, null, loader);
        }
    }

    __handleError(name, msg = null, element = null) {
        let error =`${name}: ${config.errors[code] ?? 'Undefined exception'} ${(msg ? `(${msg})` : '')}`;
        this.__echo(`<ERROR> ${error}`, { color: 'red' }, element);
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

        element.innerHTML = msg;

        this.containers.history.appendChild(element);

        return element;
    }
}