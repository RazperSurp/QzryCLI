import Toolbox from "../modules/Toolbox.mjs";
import GameBase from "./GameBase.mjs";

export default class Mineswepper extends GameBase {
    width; 
    height; 
    mines;

    positions;

    constructor(w = null, h = null, mines = null) {
        super('mineswepper');

        [this.width, this.height, this.mines] = this.__validate(w, h, mines);

        console.log(this);
    }

    __validate(w, h, m) {
        w = w === null ? Toolbox.randomIntBetween(this.config.area.width.min, this.config.area.width.max) : Math.floor(w);
        w = w < this.config.area.width.min ? this.config.area.width.min : w;
        w = w > this.config.area.width.max ? this.config.area.width.max : w;

        h = h === null ? Toolbox.randomIntBetween(this.config.area.height.min, this.config.area.height.max) : Math.floor(h);
        h = h < this.config.area.height.min ? this.config.area.height.min : h;
        h = h > this.config.area.height.max ? this.config.area.height.max : h;

        if (m === null) {
            m = Math.floor(w * h * Toolbox.randomFloatPrecisionBetween(this.config.area.mines.min, this.config.area.mines.max, 2));
        }
        else {
            let min = Math.floor(w * h * this.config.area.mines.min);
            let max = Math.floor(w * h * this.config.area.mines.max);

            m = m < min ? min : m;
            m = m > max ? max : m;
        }

        return [w,h,m];
    }
}