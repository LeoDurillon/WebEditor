import Container from "./container";
import Cursor from "./cursor";
import draw from "./draw";
import "./editor.css";
import createElement from "./element";
import createLanguage from "./languages/languageBuilder";
import State from "./state";
import Theme from "./themes/theme";
import themes from "./themes/themes";

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
    "CapsLock",
];

export default class Editor {
    private container: Container;
    private state: State;

    constructor(
        element: string | HTMLElement,
        options?: {
            prefix?: string;
            theme?: keyof typeof themes;
            colors?: Theme;
            lang?: "sql";
        }
    ) {
        const lang = createLanguage(options?.lang ?? "sql", {});
        const theme = options?.colors ?? themes[options?.theme ?? "default"];
        const selected = typeof element === 'string' ? document.querySelector(`#${element}`) : element;
        if (!selected) throw 'No editor found';
        const editor = createElement("div", {
            id: "app",
            class: "editor editor-main",
            style: { backgroundColor: theme.background }
        }, { tabIndex: 0 })

        editor.addEventListener("click", () => {
            editor.focus();
        });

        editor.appendChild(
            createElement("div", { id: "container", class: "editor-container" })
        );
        selected.appendChild(editor);
        const container = document.querySelector("#container") as HTMLElement;
        const cursor = new Cursor();
        this.state = new State(lang, theme, document.querySelector("#app")!, container, cursor);
        this.state.prefix = options?.prefix ?? "";
        this.state.cursor.cursorX = options?.prefix?.length ?? 0;

        this.container = new Container(this.state);
        this.draw();
    }

    onChange(
        fn: (value: string, event: Event, element: HTMLElement) => void
    ) {
        const onInput = (e: KeyboardEvent) => {
            if (specials.includes(e.key)) {
                e.preventDefault();
            }
            if (e.shiftKey && e.key.includes("Arrow") && this.state.cursor.selectX < 0) {
                this.state.startSelection();
            }
            if (e.ctrlKey) {
                this.executeCtrlAction(e);
            } else {
                this.executeKeyAction(e);
            }
            if (!e.shiftKey && !e.ctrlKey && this.state.cursor.selectX >= 0) {
                this.state.cursor.selectX = -1;
                this.state.cursor.selectY = -1;
            }
            fn(this.state.value.join("\n"), e, e.currentTarget as HTMLElement);
            this.draw();
        };

        const onPaste = (e: ClipboardEvent) => {
            e.preventDefault();
            const content = e.clipboardData?.getData("text");
            content?.split('\n').forEach((line, i) => {
                if (i > 0) {
                    this.state.breakLine();
                }
                this.state.add(line)
            })
            fn(this.state.value.join('\n'), e, e.currentTarget as HTMLElement)
            this.draw();
        }

        const onCut = (e: ClipboardEvent) => {
            e.preventDefault();
            e.clipboardData?.setData('text', this.state.getSelectionValue().join('\n'))
            this.state.removeSelection()
            this.draw();
        }

        const onCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            e.clipboardData?.setData('text', this.state.getSelectionValue().join('\n'));
        }

        this.state.element.addEventListener("keydown", onInput);
        this.state.element.addEventListener("cut", onCut);
        this.state.element.addEventListener("paste", onPaste);
        this.state.element.addEventListener("copy", onCopy);
        return this;
    }


    private executeKeyAction(event: KeyboardEvent) {
        if (event.key === "Enter") {
            return this.state.breakLine();
        }
        if (["Delete", "Backspace"].includes(event.key)) {
            return this.state.remove();
        }
        if (
            ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(event.key)
        ) {
            if (!event.shiftKey && this.state.cursor.selectX >= 0 && ["ArrowRight", "ArrowLeft"].includes(event.key)) {

                return this.state.cursor.moveToSelection(this.state, event.key === "ArrowRight" ? "end" : "start");
            } else {
                return this.state.cursor.move(
                    this.state,
                    event.key.toLowerCase().slice("arrow".length) as
                    | "right"
                    | "left"
                    | "up"
                    | "down"
                );
            }
        }
        if (event.key === "Tab") {
            return this.state.add(" ".repeat(this.state.lang.tabValue));
        }
        if (specials.includes(event.key)) return;
        return this.state.add(event.key);
    }

    private executeCtrlAction(event: KeyboardEvent) {
        if (event.key === "Control") return;

        if (["ArrowRight", "ArrowLeft"].includes(event.key)) {
            return this.state.cursor.moveWord(
                this.state,
                event.key.toLowerCase().slice("arrow".length) as "right" | "left"
            );
        }
        if ("v" === event.key.toLowerCase()) { return }
        if ("c" === event.key.toLowerCase()) { return }
        if ("x" === event.key.toLowerCase()) {
            return;
        }
        return this.executeKeyAction(event);
    }

    private draw() {
        draw(this.state);
        this.container.draw();
    }
}
