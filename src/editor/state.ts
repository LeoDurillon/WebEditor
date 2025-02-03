import Cursor from "./cursor";
import Language from "./languages/language";
import Theme from "./themes/theme";

export default class State {

    value: string[] = [""]
    childrens: HTMLElement[] = [document.createElement("div")]

    prefix: string = ""


    constructor(public lang: Language, public theme: Theme, public element: HTMLElement, public container: HTMLElement, public cursor: Cursor) {
    }

    startSelection() {
        this.cursor.startSelection();
    }

    getSelectionOrder() {
        const startY = this.cursor.cursorY <= this.cursor.selectY ? this.cursor.cursorY : this.cursor.selectY;
        const endY = this.cursor.cursorY >= this.cursor.selectY ? this.cursor.cursorY : this.cursor.selectY;
        const startX = this.cursor.cursorY < this.cursor.selectY ? this.cursor.cursorX : this.cursor.cursorY > this.cursor.selectY ? this.cursor.selectX : this.cursor.cursorX < this.cursor.selectX ? this.cursor.cursorX : this.cursor.selectX;
        const endX = this.cursor.cursorY < this.cursor.selectY ? this.cursor.selectX : this.cursor.cursorY > this.cursor.selectY ? this.cursor.cursorX : this.cursor.cursorX < this.cursor.selectX ? this.cursor.selectX : this.cursor.cursorX;

        return {
            startY,
            endY,
            startX,
            endX
        }
    }

    getSelectionValue() {
        const order = this.getSelectionOrder();
        const value = []
        for (let i = order.startY; i <= order.endY; i++) {
            let start = 0;
            let end = -1;
            if (i === order.startY) {
                start = order.startX;
            }
            if (i === order.endY) {
                end = order.endX;
            }
            value.push(this.getLineValue(i).slice(start, end));

        }
        return value
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
        if (this.cursor.selectX >= 0) {
            this.removeSelection()
        }
        const prev = this.getValue(0, this.cursor.cursorY);
        const next = this.getValue(this.cursor.cursorY + 1);

        const beforeCursor = this.getLineValue(this.cursor.cursorY).slice(this.cursor.cursorY === 0 ? this.prefix.length : 0, this.cursor.cursorX);

        const afterCursor = this.getLineValue(this.cursor.cursorY).slice(this.cursor.cursorX);
        this.value = [...prev, beforeCursor + key + afterCursor, ...next];
        this.cursor.cursorX += key.length;
    }

    breakLine() {
        if (this.cursor.selectX >= 0) {
            this.removeSelection()
        }
        const line = this.getLineValue(this.cursor.cursorY);
        let space = line.length - line.trimStart().length;
        if ([...this.lang.openBrackets].some(bracket => line.trim().endsWith(bracket))) {
            space += this.lang.tabValue
        }
        if ([...this.lang.closeBrackets].some(bracket => line.trim().endsWith(bracket)) && !!space) {
            space -= this.lang.tabValue;
        }
        this.value.push(" ".repeat(space));
        this.childrens.push(document.createElement("div"));
        this.cursor.cursorY += 1;
        this.cursor.cursorX = space;
    }

    remove() {
        if (this.cursor.selectX >= 0) {
            this.removeSelection()
            return;
        }
        if (!(this.cursor.cursorX - this.prefix.length) && !this.cursor.cursorY) { return; }
        if (!this.cursor.cursorX) {
            const prev = this.getValue(0, this.cursor.cursorY - 1);
            const next = this.getValue(this.cursor.cursorY + 1);
            const curr = this.value[this.cursor.cursorY - 1] + this.value[this.cursor.cursorY]
            this.cursor.cursorX = this.value[this.cursor.cursorY - 1].length + (!(this.cursor.cursorY - 1) ? this.prefix.length : 0);
            this.value = [...prev, curr, ...next];
            this.childrens.pop();
            this.cursor.cursorY -= 1;
            return;
        }

        const prev = this.getValue(0, this.cursor.cursorY);
        const next = this.getValue(this.cursor.cursorY + 1);
        const beforeCursor = this.value[this.cursor.cursorY].slice(0, this.cursor.cursorX - 1 - (!this.cursor.cursorY ? this.prefix.length : 0))
        const afterCursor = this.value[this.cursor.cursorY].slice(this.cursor.cursorX - (!this.cursor.cursorY ? this.prefix.length : 0));
        this.value = [...prev, beforeCursor + afterCursor, ...next];
        this.cursor.cursorX -= 1;
    }
}
