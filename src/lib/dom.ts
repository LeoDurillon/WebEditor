export default class DOMElement {
    element: HTMLElement

    constructor(element: HTMLElement | string) {
        if (typeof element === "string") {
            const select = document.querySelector(`#${element}`) as HTMLElement | null;
            if (!select) throw `Cannot find element with id #${element}`
            this.element = select;
        } else {
            this.element = element
        }
    };

    appendElement(property: {
        name: keyof HTMLElementTagNameMap,
        id?: string
        class?: string,
        style?: Record<string, string>
    }) {
        const element = document.createElement(property.name);
        if (property.id) {
            element.id = property.id;
        }
        if (property.class) {
            element.className = property.class;
        }
        if (property.style) {
            Object.entries(property.style).forEach(([key, val]) => {
                element.style.setProperty(key, val)
            });
        }

        this.element.appendChild(element);
        return this
    }

    setClass(value: string) {
        this.element.className = value;
        return this;
    }

    getElement(selector: string) {
        const element = this.element.querySelector(selector) as HTMLElement | null;
        if (!element) return null;
        return new DOMElement(element);
    }

    insertElement(element: HTMLElement) {
        this.element.appendChild(element);
    }

    setInnerHTML(value: string) {
        this.element.innerHTML = value;
    }
}
