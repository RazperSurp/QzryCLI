import { config } from "../modules/config.mjs";
import Toolbox from "../modules/Toolbox.mjs";
import GameBase from "./GameBase.mjs";

export default class Mineswepper extends GameBase {
    width; 
    height; 
    __mines;
    opened = 0;
    currentCell;

    __square;
    __showMines;
    __positions = [];

    set showMines(value) {
        this.__showMines = Boolean(value);
        if (this.__showMines) this.__positions.forEach(cell => { this.findCell(cell.x, cell.y).classList.add('mine'); });
        else this.__positions.forEach(cell => { this.findCell(cell.x, cell.y).classList.remove('mine'); });
    }

    set mines(value) {
        let container = document.getElementById(`${this.id}-mines-left`);
        if (container) container.innerText = value;

        this.__mines = value;
    }

    get mines() { return this.__mines; }

    get id() {
        return `mineswepper-container-${this.__id}`;
    }

    constructor(w = null, h = null, mines = null) {
        super('mineswepper', Object.assign(config.games.mineswepper, { 
            interval: { 
                enabled: true, 
                callback: () => { 
                    this.time.exceeded++;
                    document.getElementById(`${this.id}-time`).innerText = this.timeExceeded;
                }
            }
        }));

        [this.width, this.height, this.mines] = this.__validate(w, h, mines);
        this.renderArea();
    }

    placeMines() {
        if (this.__positions.length < 1) {
            let index, x, y;
            for (let i = 0; i < this.mines; i++) {
                do {
                    index = Toolbox.randomInt(this.__square); 
                    y = Math.floor(index / this.width);
                    x = index - y * this.width;
                } while (this.__positions.find(cell => (cell.x == x && cell.y == y)));

                this.__positions.push({ x: x, y: y });
            } 
        } else console.warn('Unable place mines more than one time!')
    }

    renderArea() {
        if (this.state == this.STATES.WAITING) {
            let y = 0,
                rowEl,
                cellEl;
            
            this.app.__echo(`<table class="mineswepper" id="${this.id}"></table>`, { margin: 'auto' });

            let container = document.getElementById(this.id);
            let appearInterval = setInterval(() => {
                if (y < this.height) {
                    rowEl = document.createElement('tr');
                    for (let x = 0; x < this.width; x++) {
                        cellEl = document.createElement('td');
                        cellEl.dataset.x = x;
                        cellEl.dataset.y = y;

                        if (x == 0 && y == this.height - 1) {
                            this.currentCell = cellEl;
                            this.currentCell.classList.add('current');
                        }

                        rowEl.appendChild(cellEl)
                    }

                    rowEl.classList.add
                    container.appendChild(rowEl);
                    y++;
                } else {
                    clearInterval(appearInterval);
                    this.app.__echo(`<span id="${this.id}-time"> 00:00 </span> <span id="${this.id}-status" style="background: green; padding: 2px 20px; border-radius: 10px"> Игра продолжается </span> <span id="${this.id}-mines-left"> ${this.mines} </span>`, { textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' });
                    this.app.__echo('<span class="kc37 button"> ← </span> <span class="kc38 button"> ↑ </span> <span class="kc40 button"> ↓ </span> <span class="kc39 button"> → </span> <span class="kc90 button"> z - open </span> <span class="kc88 button"> x - flag </span>', { textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' });

                }
            }, 30);
        } else console.warn('Unable to render area more than one time!');
    }

    start() {
        super.start();
    }

    restart() {
        this.__positions = [];

        super.restart();
    }

    stop(isWin = false) {
        this.showMines = true;

        super.stop(isWin);
    }

    findCell(x, y) {
        return document.querySelector(`#${this.id} td[data-x="${x}"][data-y="${y}"]`);
    }

    checkMine(x, y) {
        console.log(Boolean(this.__positions.find(cell => cell.x == x && cell.y == y )));
        return Boolean(this.__positions.find(cell => cell.x == x && cell.y == y ));
    }

    countMines(x, y) {
        let count = 0;
        this.cellNeighbors(x, y).forEach(neighbor => { if (this.checkMine(...neighbor)) { count++ } })

        return count;
    }

    countFlags(x, y) {
        let count = 0;
        this.cellNeighbors(x, y).forEach(neighbor => { if (this.findCell(...neighbor).classList.contains('flag')) { count++ } })

        return count;
    }

    cellNeighbors(x, y, ignoreMines = false, ignoreFlags = false) {
        let neighbors = [];
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i === 0 && j === 0) continue;

                let cell = this.findCell(x+i, y+j);
                if (cell && !cell.classList.contains('opened')) {
                    if (ignoreFlags || ignoreFlags) {
                        if (ignoreMines) { if (!this.checkMine(x+i, y+j)) neighbors.push([x+i, y+j]); }
                        if (ignoreFlags) { if (!cell.classList.contains('flag')) neighbors.push([x+i, y+j]); }
                    } else neighbors.push([x+i, y+j]);
                }
            }
        }

        return neighbors;
    }

    setFlag(coordinates = null, isAuto = false) {
        coordinates = coordinates ?? Object.values(this.currentCell.dataset).map(val => { return Number(val) });
        let cell = this.findCell(...coordinates);

        if (!cell.classList.contains('opened')) {
            if (!isAuto && cell.classList.contains('flag')) {
                this.mines = this.mines + 1;
                cell.classList.remove('flag');
            } else {
                if (!cell.classList.contains('flag')) this.mines = this.mines - 1;
                cell.classList.add('flag');
            }
        } else {
            let neighbors = this.cellNeighbors(...coordinates);
            if (this.countMines(...coordinates) == neighbors.length) {
                neighbors.forEach(neighbor => { this.setFlag(neighbor, true) });
            };
        }
    }

    openCell(coordinates = null, doAuto = false) {
        coordinates = coordinates ?? Object.values(this.currentCell.dataset).map(val => { return Number(val) });
        let cell = this.findCell(...coordinates);

        if (this.opened === 0 && !doAuto) {
            do {
                this.__positions = [];
                this.placeMines();
            } while (this.checkMine(...coordinates) || this.countMines(...coordinates) > 0);

            this.openCell(coordinates, true);
        } else {
            let minesNearby = this.countMines(...coordinates);

            if (cell.classList.contains('opened') && minesNearby == this.countFlags(...coordinates)) {
                this.cellNeighbors(coordinates[0], coordinates[1], false, true).forEach(neighbor => { this.openCell(neighbor) });
            } if (!cell.classList.contains('flag') && !cell.classList.contains('opened')) {
                if (!doAuto && this.checkMine(...coordinates)) {
                    cell.innerText = 'X';
                    this.stop(false)
                } else {
                    this.findCell(...coordinates).classList.add('opened');
                    if (minesNearby === 0) {
                        this.cellNeighbors(coordinates[0], coordinates[1], true).forEach(neighbor => { this.openCell(neighbor, true) });
                    } else this.findCell(...coordinates).innerText = minesNearby;

                    this.opened++;
                    if (this.__square - (this.opened + this.__positions.length) === 0) this.stop(true);        
                };
            }
        }
    }

    __validate(w, h, m) {
        w = (w === null || Number.isNaN(Number(w))) ? Toolbox.randomIntBetween(this.config.area.width.min, this.config.area.width.max) : Math.floor(w);
        w = w < this.config.area.width.min ? this.config.area.width.min : w;
        w = w > this.config.area.width.max ? this.config.area.width.max : w;

        h = (h === null || Number.isNaN(Number(h))) ? Toolbox.randomIntBetween(this.config.area.height.min, this.config.area.height.max) : Math.floor(h);
        h = h < this.config.area.height.min ? this.config.area.height.min : h;
        h = h > this.config.area.height.max ? this.config.area.height.max : h;

        this.__square = w*h;

        if ((m === null || Number.isNaN(Number(m)))) m = Math.floor(this.__square * Toolbox.randomFloatPrecisionBetween(this.config.area.mines.min, this.config.area.mines.max, 2));
        else {
            let min = Math.floor(this.__square * this.config.area.mines.min);
            let max = Math.floor(this.__square * this.config.area.mines.max);

            m = m < min ? min : m;
            m = m > max ? max : m;
        }

        return [w,h,m];
    }

    setCurrent(x,y) {
        console.log(x, y, this.findCell(x,y))
        if (this.findCell(x,y)) {
            this.currentCell = this.findCell(x,y);
            console.log(this.currentCell);

            document.querySelectorAll('.mineswepper .current').forEach(cell => cell.classList.remove('current'));

            this.currentCell.classList.add('current');
        } else console.warn(`Unable to find cell [${x};${y}]`);
    }

    processKeyup(e) {
        if (this.state == this.STATES.GOING) {
            switch (e.keyCode) {
                case 40: // ArrowDown
                    this.setCurrent(Number(this.currentCell.dataset.x), Number(this.currentCell.dataset.y) + 1);
                    break;
                case 39: // ArrowRight
                    this.setCurrent(Number(this.currentCell.dataset.x) + 1, Number(this.currentCell.dataset.y));
                    break;
                case 38: // ArrowUp
                    this.setCurrent(Number(this.currentCell.dataset.x), Number(this.currentCell.dataset.y) - 1);
                    break;
                case 37: // ArrowLeft
                    this.setCurrent(Number(this.currentCell.dataset.x) - 1, Number(this.currentCell.dataset.y));
                    break;
                case 88: // x
                    this.setFlag();
                    break;
                case 90: // z
                    this.openCell();
                    break;
                case 67: // c (using e.ctrlKey)
                    if (e.ctrlKey) {
                        this.stop();
                        this.app.state = this.app.STATES.WAITING;
                    }
                    break;

            }   
        }
    }
}