import DOMElement from "../lib/dom";
import Language from "./languages/language";
import Theme from "./themes/theme";

export default class State {

    value: string[] = [""]
    childrens: HTMLElement[] = [document.createElement("div")]

    prefix: string = ""

    cursorX: number = 0
    cursorY: number = 0

    selectStart: [number, number] = [0, 0];
    selectEnd: [number, number] = [0, 0];

    constructor(public lang: Language, public theme: Theme, public element: DOMElement, public container: DOMElement) {
    }


    getLineValue(index: number) {
        const line = this.value[index];
        let value = "";

        if (index === 0) {
            value += this.prefix;
        }

        value += line;

        return value
    }

    getValue(start: number, end?: number) {
        if (start === end) {
            return [];
        }

        return this.value.slice(start, end)
    }


    add(key: string) {
        const prev = this.getValue(0, this.cursorY);
        const next = this.getValue(this.cursorY + 1);
        const beforeCursor = this.value[this.cursorY].slice(0, this.cursorX - (!this.cursorY ? this.prefix.length : 0))
        const afterCursor = this.value[this.cursorY].slice(this.cursorX - (!this.cursorY ? this.prefix.length : 0));
        this.value = [...prev, beforeCursor + key + afterCursor, ...next];
        this.cursorX += key.length;
    }

    breakLine() {
        const line = this.getLineValue(this.cursorY);
        let space = line.length - line.trimStart().length;
        if ([...this.lang.openBrackets].some(bracket => line.trim().endsWith(bracket))) {
            space += this.lang.tabValue
        }
        if ([...this.lang.closeBrackets].some(bracket => line.trim().endsWith(bracket)) && !!space) {
            space -= this.lang.tabValue;
        }
        this.value.push(" ".repeat(space));
        this.childrens.push(document.createElement("div"));
        this.cursorY += 1;
        this.cursorX = space;
    }

    remove() {
        if (!(this.cursorX - this.prefix.length) && !this.cursorY) { return; }
        if (!this.cursorX) {
            this.cursorX = this.value[this.cursorY - 1].length + (!(this.cursorY - 1) ? this.prefix.length : 0);
            this.value = [...this.value.slice(0, this.cursorY - 1), this.value[this.cursorY - 1] + this.value[this.cursorY], ...this.value.slice(this.cursorY + 1)]
            this.childrens = [...this.childrens.slice(0, this.cursorY - 1), ...this.childrens.slice(this.cursorY)];
            this.cursorY -= 1;
            return;
        }

        const prev = this.getValue(0, this.cursorY);
        const next = this.getValue(this.cursorY + 1);
        const beforeCursor = this.value[this.cursorY].slice(0, this.cursorX - 1 - (!this.cursorY ? this.prefix.length : 0))
        const afterCursor = this.value[this.cursorY].slice(this.cursorX - (!this.cursorY ? this.prefix.length : 0));
        this.value = [...prev, beforeCursor + afterCursor, ...next];
        this.cursorX -= 1;
    }
}
