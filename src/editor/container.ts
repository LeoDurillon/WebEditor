import draw from './draw';
import State from './state';

export default class Container {

    constructor(public state: State) { }

    draw() {
        this.state.container.innerHTML = "";
        this.state.childrens.forEach((el, index) => {
            const moveToChar = (event: MouseEvent) => {
                event.stopPropagation();
                const element = event.currentTarget as HTMLElement;
                const { left, right } = element?.getBoundingClientRect();
                const position = event.clientX;
                this.state.cursor.cursorY = index;
                const length = this.state.getLineValue(index).length;
                const calc = Math.round((position - left) / (right - left) * length)
                this.state.cursor.cursorX = Math.min(calc, length);
                draw(this.state);
                this.draw();
            }

            const moveToLine = (event: MouseEvent) => {
                this.state.cursor.cursorX = this.state.getLineValue(index).length;
                this.state.cursor.cursorY = index;
                draw(this.state);
                this.draw()
            };

            const text = el.querySelector('pre');
            el.addEventListener("click", moveToLine)
            if (text) {
                text.addEventListener("click", moveToChar);
            };
            this.state.container.appendChild(el)
        })
    }
}

