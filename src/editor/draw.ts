import Cursor from "./cursor";
import State from "./state";

export default function draw(state: State) {

    state.childrens.forEach((el, i) => {
        if (
            !(
                state.cursor.selectY >= 0 &&
                ((i <= state.cursor.selectY && i >= state.cursor.cursorY) ||
                    (i <= state.cursor.cursorY && i >= state.cursor.selectY))
            )
        ) {
            el.className = "";
            const select = el.querySelector(".editor-selection-container");
            if (select) {
                el.removeChild(select);
            }
        }
        const content = state.lang.parse(state.getLineValue(i));
        el.innerHTML = "<pre>" + content.join("") + "</pre>";
        const cursor = el.querySelector(".editor-cursor-container");
        if (!cursor) return;
        el.removeChild(cursor);
    });

    const container = state.childrens[state.cursor.cursorY];

    container.className = "active";
    container.appendChild(state.cursor.createCursor(state));
    if (state.cursor.selectX >= 0) {
        state.drawSelection();
    }
}
