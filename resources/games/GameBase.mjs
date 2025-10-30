import { config } from "../modules/config.mjs";

export default class GameBase {
    __state;
    type;
    time = { start: 0, end: 0, exceeded: 0, interval: 0 };

    config;
    baseConfig;

    get STATES() { return { WAITING: 0, GOING: 1, LOST: 2, WINNED: 3 } }

    get state() {
        switch (this.__state) {
            case 0: return 'Ожидание';
            case 1: return 'Запущена';
            case 2: return 'Поражение';
            case 3: return 'Победа!';
        }
    }

    constructor(type, gameConfig = null) {
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
            this.__state = this.STATES.WAITING;

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

            this.__state = isWin ? this.STATES.WINNED : this.STATES.LOST;
        }
    }
}