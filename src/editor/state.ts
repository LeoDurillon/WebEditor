import DOMElement from "../lib/dom";
import Language from "./languages/language";
import Theme from "./themes/theme";

export default class State {

    value: string[] = [""]
    childrens: HTMLElement[] = [document.createElement("div")]

    prefix: string = ""

    cursorX: number = 0
    cursorY: number = 0

    selectX: number = -1;
    selectY: number = -1;

    constructor(public lang: Language, public theme: Theme, public element: DOMElement, public container: DOMElement) {
    }

    startSelection() {
        this.selectX = this.cursorX;
        this.selectY = this.cursorY;
    }

    getSelectionOrder() {
        const startY = this.cursorY <= this.selectY ? this.cursorY : this.selectY;
        const endY = this.cursorY >= this.selectY ? this.cursorY : this.selectY;
        const startX = this.cursorY < this.selectY ? this.cursorX : this.cursorY > this.selectY ? this.selectX : this.cursorX < this.selectX ? this.cursorX : this.selectX;
        const endX = this.cursorY < this.selectY ? this.selectX : this.cursorY > this.selectY ? this.cursorX : this.cursorX < this.selectX ? this.selectX : this.cursorX;

        return {
            startY,
            endY,
            startX,
            endX
        }
    }

    drawSelection() {
        const order = this.getSelectionOrder();
        const elements = this.childrens.slice(order.startY, order.endY + 1);

        elements.forEach((el, i) => {
            el.className = "active";
            const text = this.getLineValue(order.startY + i);
            const selectionStart = i === 0 ? order.startX : 0
            const selectionEnd = i === elements.length - 1 ? order.endX : text.length
            const div = document.createElement("div");
            div.className = "editor-selection-container"
            const pre = document.createElement("pre");
            pre.className = "selection"
            pre.innerHTML = text.slice(selectionStart, selectionEnd);
            div.innerHTML = `<pre class="hidden">${text.slice(0, selectionStart)}</pre>${pre.outerHTML}<pre class="hidden">${text.slice(selectionEnd)}</pre>`;
            el.appendChild(div)
        })
    }

    removeSelection() {
        const order = this.getSelectionOrder();
        const prev = this.getValue(0, order.startY);
        const next = this.getValue(order.endY + 1);

        const curr = this.getValue(order.startY, order.endY + 1);
        const start = curr[0].slice(0, order.startX - (!order.startY ? this.prefix.length : 0));
        const end = curr.pop()?.slice(order.endX - (!order.endY ? this.prefix.length : 0));

        this.value = [...prev, start + end, ...next]
        if (this.childrens.length > this.value.length) {
            this.childrens = this.childrens.slice(0, this.value.length);
        }
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
        if (this.selectX >= 0) {
            this.removeSelection()
        }
        const prev = this.getValue(0, this.cursorY);
        const next = this.getValue(this.cursorY + 1);

        const beforeCursor = this.getLineValue(this.cursorY).slice(this.cursorY === 0 ? this.prefix.length : 0, this.cursorX);

        const afterCursor = this.getLineValue(this.cursorY).slice(this.cursorX);
        this.value = [...prev, beforeCursor + key + afterCursor, ...next];
        this.cursorX += key.length;
    }

    breakLine() {
        if (this.selectX >= 0) {
            this.removeSelection()
        }
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
        if (this.selectX >= 0) {
            this.removeSelection()
            return;
        }
        if (!(this.cursorX - this.prefix.length) && !this.cursorY) { return; }
        if (!this.cursorX) {
            const prev = this.getValue(this.cursorY - 1);
            const next = this.getValue(this.cursorY + 1);
            const curr = this.value[this.cursorY - 1] + this.value[this.cursorY]
            this.cursorX = this.value[this.cursorY - 1].length + (!(this.cursorY - 1) ? this.prefix.length : 0);
            this.value = [...prev, curr, ...next];
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
