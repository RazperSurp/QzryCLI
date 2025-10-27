import { config } from './config.mjs';
import Directory from './Directory.mjs';

export default class Command {
    get BASE_PATH () { return '.\\paths\\'; }

    get ERRORS () {
        return {
            "COMMAND_NOT_FOUND": -1,
            "IMAGE_NOT_FOUND": -2,
            "PATH_NOT_FOUND": -3,
        }
    }

    path;
    name;
    args;
    results;
    status = 0;

    clearRequired = 0;
    moveTo;

    constructor(name, ...args) {
        this.path = path;
        this.name = name;
        this.args = args.filter(el => el);

        if(typeof this[name] != 'function') this.handleError(this.ERRORS.COMMAND_NOT_FOUND);
    }

    async execute() {
        if (this.status == 0) {
            try {
                this.results = await this[this.name]() ?? '';
            } catch (e) {
                this.results = e.message;
            }
            if (this.status == 0) this.status = 1;
            else this.handleError(this.status);
        } 

        
        return this.results;
    }

    handleError(code) {
        this.status = code;
        this.results = `${config.errors[code]}: ${this.errmessage ? this.errmessage : this.name}`;
    }

    ping() {
        return 'ПОНГ'
    }
    
    help() {
        let results = "";
        for (const [command, params] of Object.entries(config.commands)) {
            results += `${command} ${params.args !== undefined ? Object.keys(params.args).map(argParamName => { return `${params.args[argParamName].required ? '[' : '<'}${argParamName}${params.args[argParamName].required ? ']' : '>'}` }).join(' ') : ''} - ${params.comment}<br>`
        }

        return results;
    }

    clear() {
        this.clearRequired = true;
    }

    async cd() {
        if (this.args[0]) {

            if (this.args[0].startsWith('\\')) window.Application.currentDir = Directory.findByPath(this.args[0]);
            else window.Application.currentDir = Directory.findByPath(this.args[0], window.Application.currentDir);

            return window.Application.currentDir;
        }
    }

    async pic() {
        const url = `../../assets/${this.args[0]}`;
        const response = await fetch(url);
        
        if (response.status == 200) {
            let pic = document.createElement('img');
            pic.setAttribute('src', `../../assets/${this.args[0]}`);
            
            return pic;
        } else {
            this.errmessage = this.args[0];
            this.handleError(this.ERRORS.IMAGE_NOT_FOUND);
        }
    }

    async randompic() {
        let alphabet = String('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789').split(''),
            pic = document.createElement('img'),
            idImage = '',
            successFetch = false,
            i = 0;
    
        const generateURI = () => {
            let idImage = '';
            for (let i = 0; i < 5; i++) idImage += alphabet[Math.floor(Math.random() * alphabet.length)];

            return idImage;
        } 


        do {
            idImage = generateURI();
            const response = await fetch(`https://i.imgur.com/${idImage}.jpg`);
            console.log([response.status == 200, response.url != 'https://i.imgur.com/removed.png', response.status == 200 && response.url != 'https://i.imgur.com/removed.png']);

            if (response.status == 200 && response.url != 'https://i.imgur.com/removed.png') {
                pic.setAttribute('src', `https://i.imgur.com/${idImage}.jpg`)
                return pic;
            }   
        } while (true);

    }
}

