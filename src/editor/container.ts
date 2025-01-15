import State from './state';

export default class Container {

    constructor(public state: State) { }

    draw() {
        this.state.container.innerHTML = "";
        this.state.childrens.forEach(el =>
            this.state.container.appendChild(el)
        )
    }
}
