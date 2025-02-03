import State from "./state";

export default class Cursor {

    cursorX: number = 0;
    cursorY: number = 0;

    selectX: number = -1;
    selectY: number = -1;

    constructor() { }

    startSelection() {
        this.selectX = this.cursorX;
        this.selectY = this.cursorY;
    }

    move(state: State, direction: "right" | "left" | "down" | "up") {
        switch (direction) {
            case "up": {
                if (!this.cursorY) { break; };
                if (state.getLineValue(this.cursorY - 1).length < this.cursorX) {
                    this.cursorX = state.getLineValue(this.cursorY - 1).length;
                } else {
                    this.cursorX += !(this.cursorY - 1) ? state.prefix.length : 0
                }
                --this.cursorY;
                break;
            }
            case "right": {
                if (this.cursorX === state.getLineValue(this.cursorY).length) {
                    if (this.cursorY === state.value.length - 1) {
                        break;
                    } else {
                        this.cursorX = 0;
                        this.cursorY += 1;
                        break;
                    }
                }
                ++this.cursorX;
                break;
            }
            case "left": {
                if (this.cursorX === state.prefix.length && this.cursorY === 0) { break; }
                if (this.cursorX === 0) {
                    this.cursorX = state.getLineValue(this.cursorY - 1).length;
                    this.cursorY -= 1
                    break;
                }
                --this.cursorX;
                break;
            }
            case "down": {
                if (this.cursorY === state.value.length - 1) { break; }
                if (this.cursorX - (!this.cursorY ? state.prefix.length : 0) > state.getLineValue(this.cursorY + 1).length) {
                    this.cursorX = state.getLineValue(this.cursorY + 1).length
                } else if (!this.cursorY) {
                    this.cursorX -= state.prefix.length
                }
                ++this.cursorY;
                break;
            }

        }
    }

    moveToSelection(state: State, direction: "start" | "end") {
        const order = state.getSelectionOrder();
        switch (direction) {
            case "start": {
                this.cursorX = order.startX;
                this.cursorY = order.startY;
                break;
            }

            case "end": {
                this.cursorX = order.endX;
                this.cursorY = order.endY;
                break;
            }
        }
    }


    moveWord(state: State, direction: "right" | "left") {

        switch (direction) {
            case "right": {
                const line = state.getLineValue(this.cursorY);
                if (this.cursorX === line.length && this.cursorY < state.value.length - 1) {
                    this.cursorY += 1;
                    this.cursorX = 0;
                    break;
                }
                const partialLine = line.slice(this.cursorX);
                const splitted = partialLine.split(" ");
                this.cursorX += !splitted[0] ? splitted[1].length + 1 : splitted[0].length
                break;
            }
            case "left": {
                const cursorX = this.cursorX - (!this.cursorY ? state.prefix.length : 0);
                if (!cursorX && !this.cursorY) {
                    break;
                }
                if (!cursorX) {
                    const line = state.getLineValue(this.cursorY - 1);
                    this.cursorX = line.length;
                    this.cursorY -= 1;
                    break;
                }
                const line = state.getLineValue(this.cursorY);
                const partialLine = line.slice(0, this.cursorX);
                const splitted = partialLine.split(" ").reverse();
                this.cursorX -= !splitted[0] ? splitted[1].length + 1 : splitted[0].length
                break;
            }


        }
    }

    createCursor(state: State) {

        const container = document.createElement("div");
        const span = document.createElement("span");
        const before = document.createElement("pre");
        const after = document.createElement("pre");

        before.innerHTML = (this.cursorY === 0 ? state.prefix : "") + state.value[this.cursorY].slice(0, this.cursorX - (!this.cursorY ? state.prefix.length : 0));
        after.innerHTML = state.value[this.cursorY].slice(this.cursorX);

        before.style.visibility = "hidden";
        after.style.visibility = "hidden";

        container.className = "editor-cursor-container";
        span.className = "cursor";
        span.style.background = state.theme.text

        container.append(before, span, after);
        return container;
    }

}
