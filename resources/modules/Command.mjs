import { config } from './config.mjs';
import Directory from './Directory.mjs';

export default class Command {
    get BASE_PATH () { return '.\\paths\\'; }

    get ERRORS () {
        let errors = {};
        Object.keys(config.errors).forEach((code, i) => { errors[(i + 1) * -1] = code; })

        return errors;
    }

    __app;

    path;
    name;
    args;
    results;
    status = 0;

    clearRequired = 0;
    moveTo;

    constructor(name, ...args) {
        this.__app = window.Application;

        this.path = path;
        this.name = name;
        this.args = args.filter(el => el);

        if(typeof this[name] != 'function') this.results = this.handleError('COMMAND_NOT_FOUND');
    }

    async execute() {
        if (this.status == 0) {
            try {
                this.results = await this[this.name]() ?? '';
            } catch (e) {
                console.error(e);
                this.results = e.message;
            }
            if (this.status == 0) this.status = 1;
        } 

        console.log(this.results);
        return this.results;
    }

    handleError(name) {
        this.status = typeof name == 'string' ? this.__findErrorStatusByName(name) : name;

        return {
            status: 'error',
            name: this.ERRORS[this.status],
            code: this.status,
            msg: config.errors[name]
        }
    }

    __findErrorStatusByName(name) {
        let errMap = Object.entries(this.ERRORS).filter(err => err[1] == name)[0];
        let result = errMap ? errMap[0] : -1;

        console.warn(result);

        return result;
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
            let directory = this.args[0].startsWith('\\') ? Directory.findByPath(this.args[0]) : Directory.findByPath(this.args[0], this.__app.__currentDir);
            if (directory.status == 'error') return this.handleError(directory.code);
            else this.__app.currentDir = directory;

            return `<log> Сменили директорию на "${directory.stringify()}" </log>`;
        } else return this.handleError('ARGUMENT_NOT_FOUND');
    }

    async open() {
        if (this.args[0]) {
            let fileName = this.args[0]
            if (this.__app.__currentDir.files.find(name => name === fileName)) {
                const FILE_HREF = `paths\\root\\${this.__app.__currentDir.stringify()}\\${fileName}`;

                let fileContent = await fetch(FILE_HREF);

                const checkType = (type) => {
                    console.log(type);

                    if (type == 'text/plain') return 0;
                    if (type.startsWith('image')) return 1;
                } 

                this.__app.__echo(`<log> ===[ CONTENT OF ${fileName} ]=== </log>`)
                switch (checkType(fileContent.headers.get('Content-type').split(';')[0])) {
                    case 0: this.__app.__echo(await fileContent.text()); break;
                    case 1: this.__app.__echo(`<img src="${FILE_HREF}">`); break;
                    default: return this.handleError('CONTENT_TYPE_NOT_SUPPORTED');
                }

                this.__app.__echo(`\n<log> ===[ END ]=== </log>`);

            } else return this.handleError('FILE_NOT_FOUND');
        } else return this.handleError('ARGUMENT_NOT_FOUND');
    }

    async ls() {
        return this.__app.__currentDir.children;
    }

    async randompic() {
        if (window.location.hostname == '127.0.0.1') {
            return this.handleError('UNAVALIBLE_IN_LOCAL');
        } else {
            let alphabet = String('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789').split(''),
                pic = '',
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
                    return `<img src="https://i.imgur.com/${idImage}.jpg">`;
                }   
            } while (true);
        }
    }
}

