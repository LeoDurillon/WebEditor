import State from "./state";

export default class Cursor {

    constructor(public state: State) { }

    move(direction: "right" | "left" | "down" | "up") {
        switch (direction) {
            case "up": {
                if (!this.state.cursorY) { break; };
                if (this.state.getLineValue(this.state.cursorY - 1).length < this.state.cursorX) {
                    this.state.cursorX = this.state.getLineValue(this.state.cursorY - 1).length;
                } else {
                    this.state.cursorX += !(this.state.cursorY - 1) ? this.state.prefix.length : 0
                }
                --this.state.cursorY;
                break;
            }
            case "right": {
                if (this.state.cursorX === this.state.getLineValue(this.state.cursorY).length) {
                    if (this.state.cursorY === this.state.value.length - 1) {
                        break;
                    } else {
                        this.state.cursorX = 0;
                        this.state.cursorY += 1;
                        break;
                    }
                }
                ++this.state.cursorX;
                break;
            }
            case "left": {
                if (this.state.cursorX === this.state.prefix.length && this.state.cursorY === 0) { break; }
                if (this.state.cursorX === 0) {
                    this.state.cursorX = this.state.getLineValue(this.state.cursorY - 1).length;
                    this.state.cursorY -= 1
                    break;
                }
                --this.state.cursorX;
                break;
            }
            case "down": {
                if (this.state.cursorY === this.state.value.length - 1) { break; }
                if (this.state.cursorX - (!this.state.cursorY ? this.state.prefix.length : 0) > this.state.getLineValue(this.state.cursorY + 1).length) {
                    this.state.cursorX = this.state.getLineValue(this.state.cursorY + 1).length
                } else if (!this.state.cursorY) {
                    this.state.cursorX -= this.state.prefix.length
                }
                ++this.state.cursorY;
                break;
            }

        }
    }

    moveWord(direction: "right" | "left") {

        switch (direction) {
            case "right": {
                const line = this.state.getLineValue(this.state.cursorY);
                if (this.state.cursorX === line.length && this.state.cursorY < this.state.value.length - 1) {
                    this.state.cursorY += 1;
                    this.state.cursorX = 0;
                    break;
                }
                const partialLine = line.slice(this.state.cursorX);
                const splitted = partialLine.split(" ");
                this.state.cursorX += !splitted[0] ? splitted[1].length + 1 : splitted[0].length
                break;
            }
            case "left": {
                const cursorX = this.state.cursorX - (!this.state.cursorY ? this.state.prefix.length : 0);
                if (!cursorX && !this.state.cursorY) {
                    break;
                }
                if (!cursorX) {
                    const line = this.state.getLineValue(this.state.cursorY - 1);
                    this.state.cursorX = line.length;
                    this.state.cursorY -= 1;
                    break;
                }
                const line = this.state.getLineValue(this.state.cursorY);
                const partialLine = line.slice(0, this.state.cursorX);
                const splitted = partialLine.split(" ").reverse();
                this.state.cursorX -= !splitted[0] ? splitted[1].length + 1 : splitted[0].length
                break;
            }


        }
    }

    createCursor() {

        const container = document.createElement("div");
        const span = document.createElement("span");
        const before = document.createElement("pre");
        const after = document.createElement("pre");

        before.innerHTML = (this.state.cursorY === 0 ? this.state.prefix : "") + this.state.value[this.state.cursorY].slice(0, this.state.cursorX - (!this.state.cursorY ? this.state.prefix.length : 0));
        after.innerHTML = this.state.value[this.state.cursorY].slice(this.state.cursorX);

        before.style.visibility = "hidden";
        after.style.visibility = "hidden";

        container.className = "editor-cursor-container";
        span.className = "cursor";
        span.style.background = this.state.theme.text

        container.append(before, span, after);
        return container;
    }

}
