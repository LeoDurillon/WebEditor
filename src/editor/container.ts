import State from './state';

export default class Container {

    constructor(public state: State) { }

    draw() {
        this.state.container.setInnerHTML("");
        this.state.childrens.forEach(el =>
            this.state.container.insertElement(el)
        )
    }
}
