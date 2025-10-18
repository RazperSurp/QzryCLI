import { config } from './config.mjs';

export default class Command {
    get ERRORS () {
        return {
            "COMMAND_NOT_FOUND": -1
        }
    }

    name;
    args;
    results;
    status = 0;
    clearRequired = 0;
    constructor(name, ...args) {
        this.name = name;
        this.args = args;

        if(typeof this[name] != 'function') this.handleError(this.ERRORS.COMMAND_NOT_FOUND);
    }

    async execute() {
        if (this.status == 0) {
            this.results = await this[this.name]() ?? '';
            this.status = 1;
        }
    }

    handleError(code) {
        this.status = code;
        this.results = `${config.errors[code]}: ${this.name}`;
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

    pic() {
        let pic = document.createElement('img');
        pic.setAttribute('src', `../../assets/${this.args[0]}`);

        return pic;
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
        } while (!successFetch || i < 10);

    }
}

