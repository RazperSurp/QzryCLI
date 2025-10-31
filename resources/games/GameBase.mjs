import { config } from "../modules/config.mjs";

export default class GameBase {
    __id;
    __state;

    type;
    time = { start: 0, end: 0, exceeded: 0, interval: 0 };

    config;
    baseConfig;

    get STATES() { return { WAITING: 0, GOING: 1, LOST: 2, WINNED: 3, ENDED: 4 } }
    get state() { return this.__state; }
    get app() { return window.Application; }
    get timeExceeded() { 
        let daysPassed = String(Math.floor(this.time.exceeded / 86400));
        let hoursPassed = String(Math.floor((this.time.exceeded - (daysPassed * 86400)) / 3600));
        let minutesPassed = String(Math.floor((this.time.exceeded - ((daysPassed * 86400) + (hoursPassed * 3600))) / 60));
        let secondsPassed = String(this.time.exceeded - ((daysPassed * 86400) + (hoursPassed * 3600) + (minutesPassed * 60)));

        const TIME_PARSED = {
            days: daysPassed != 0 ? daysPassed.length > 1 ? `${daysPassed} дн. ` : `0${daysPassed} дн. ` : '',
            hours: hoursPassed != 0 ? hoursPassed.length > 1 ? `${hoursPassed}:` : `0${hoursPassed}:` : '',
            minutes: minutesPassed != 0 ? minutesPassed.length > 1 ? `${minutesPassed}:` : `0${minutesPassed}:` : '00:',
            seconds: secondsPassed != 0 ? secondsPassed.length > 1 ? `${secondsPassed}` : `0${secondsPassed}` : '00',
        }

        return `${TIME_PARSED.days}${TIME_PARSED.hours}${TIME_PARSED.minutes}${TIME_PARSED.seconds}`;
    }

    set state(value) {
        let container = document.getElementById(`${this.id}-status`),
            status = '';
        switch (value) {
            default: case 0: status = 'Ожидание начала'; break;
            case 1: status = 'Игра продолжается'; break;
            case 2: status = 'Поражение'; break;
            case 3: status = 'Победа'; break;
            case 4: status = 'Завершено'; break;
        }

        if (container) container.innerText = status;
        this.__state = value;
    }

    constructor(type, gameConfig = null) {
        this.__id = this.app.processes.length + 1;

        this.type = type;
        this.baseConfig = config.games[this.type];
        this.config = gameConfig ?? this.baseConfig;

        this.__state = this.STATES.WAITING;
    }

    start() {
        if (this.__state !== this.STATES.WAITING) console.warn('Unable to begin already started game!')
        else {
            this.time.start = Date.now();
            if (this.config.interval.enabled) this.time.interval = setInterval(this.config.interval.callback ?? (() => { this.config.interval.exceeded++; }), this.config.interval.seconds ?? 1000);

            this.__state = this.STATES.GOING;
        }
    }

    restart() {
        if (this.__state === this.STATES.WAITING) console.warn('Unable to restart not started game!');
        else {
            this.state = this.STATES.WAITING;

            if (this.config.interval.enabled && this.time.interval !== null) clearInterval(this.time.interval);
            this.time.end = 0;
            this.time.exceeded = 0;

            this.start();
        }
    }

    stop(isWin = false) {
        if (this.__state !== this.STATES.GOING) console.warn('Unable to stop not started game!');
        else {
            if (this.config.interval.enabled && this.time.interval !== null) clearInterval(this.time.interval);
            this.time.end = Date.now();

            this.state = isWin ? this.STATES.WINNED : this.STATES.LOST;
            this.app.state = this.app.STATES.WAITING;
        }
    }

    processKeyup(e) { }
}