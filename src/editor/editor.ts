import DOMElement from "../lib/dom";
import Container from "./container";
import createLanguage from "./languages/languageBuilder";
import Theme from "./themes/theme";
import themes from "./themes/themes";
import "./editor.css";
import State from "./state";
import Cursor from "./cursor";

const specials = [
    "Control",
    "Shift",
    "Home",
    "PageUp",
    "PageDown",
    "Alt",
    "AltGraph",
    "Escape",
    "Meta",
    "Tab",
    "CapsLock"
];


export default class Editor {
    private container: Container;
    private state: State;
    private cursor: Cursor;

    constructor(element: string | HTMLElement, options?: {
        prefix?: string
        theme?: keyof typeof themes;
        colors?: Theme;
        lang?: "sql"
    }) {
        const lang = createLanguage(options?.lang ?? "sql", {})
        const theme = options?.colors ?? themes[options?.theme ?? "default"]

        const selected = new DOMElement(element);
        selected.element.style.backgroundColor = theme.background;
        selected.setClass("editor editor-main");
        selected.appendElement({ name: "div", class: "editor-container", id: "container" });
        selected.element.setAttribute("tabindex", '0');

        selected.element.addEventListener("click", () => { selected.element.focus() })
        const container = new DOMElement("container");
        this.state = new State(lang, theme, selected, container)
        this.state.prefix = options?.prefix ?? "";
        this.state.cursorX = options?.prefix?.length ?? 0

        this.cursor = new Cursor(this.state);
        this.container = new Container(this.state);
        this.draw();
    }

    onChange(fn: (value: string, event: KeyboardEvent, element: HTMLInputElement) => void) {
        const onInput = (e: KeyboardEvent) => {
            e.preventDefault();
            if (e.ctrlKey) {
                this.executeCtrlAction(e);
            }
            else {
                this.executeKeyAction(e);
            }
            fn(this.state.value.join('\n'), e, e.currentTarget as HTMLInputElement)
            this.draw()
        }

        this.state.element.element.addEventListener("keydown", onInput);
        return this
    }

    private executeKeyAction(event: KeyboardEvent) {
        if (event.key === "Enter") {
            return this.state.breakLine();
        }
        if (["Delete", "Backspace"].includes(event.key)) {
            return this.state.remove()
        }
        if ([
            "ArrowRight",
            "ArrowLeft",
            "ArrowUp",
            "ArrowDown",
        ].includes(event.key)) {
            return this.cursor.move(event.key.toLowerCase().slice('arrow'.length) as "right" | "left" | "up" | "down")
        }
        if (event.key === "Tab") {
            return this.state.add(" ".repeat(this.state.lang.tabValue));
        }
        if (specials.includes(event.key)) return;
        return this.state.add(event.key)
    }

    private executeCtrlAction(event: KeyboardEvent) {
        if (event.key === "Control") return;

        if (["ArrowRight", "ArrowLeft"].includes(event.key)) {
            return this.cursor.moveWord(event.key.toLowerCase().slice("arrow".length) as "right" | "left")
        }

        return this.executeKeyAction(event)
    }

    private draw() {
        this.state.childrens.forEach(el => {
            el.className = ""
            const cursor = el.querySelector("div");
            if (!cursor) return
            el.removeChild(cursor)
        })

        const content = this.state.lang.parse(this.state.getLineValue(this.state.cursorY));
        const container = this.state.childrens[this.state.cursorY];
        container.innerHTML = "<pre>" + content.join("") + "</pre>";
        container.className = "";

        container.className = "active"
        container.appendChild(this.cursor.createCursor());
        this.container.draw();
    }
}