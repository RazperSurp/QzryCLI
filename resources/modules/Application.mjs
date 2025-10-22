import Command from "./Command.mjs";
import { config } from "./config.mjs";
import User from "./User.mjs";

export default class Application {
    currentPath;
    user;
    command;

    containers;

    history = [];

    constructor (user = null, password = null) {
        this.user = User.login(user ?? 'guest', password);
        if (!(this.user instanceof User)) this.__handleError('INVALID_CREDENTIALS');
        
        this.currentPath = this.user.homePath;

        this.containers = {
            history: document.querySelector('#history'),
            path: document.querySelector('#path')
        };
    }

    async process(...input) {
        this.command = new Command(input.shift(), input);

        let loader = this.__echo('');
        loader.classList.add('loader');

        let results = await this.command.execute();
        if (results && results.status == 'error') this.__handleError(results.name, results.msg, loader);
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

        this.containers.history.appendChild(msg);

        return element;
    }
}