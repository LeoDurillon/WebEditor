import Theme from "../themes/theme";
import themes from "../themes/themes";

export default abstract class Language {

    keywords: Set<string> = new Set();
    operators: Set<string> = new Set();
    openBrackets: Set<string> = new Set();
    closeBrackets: Set<string> = new Set();
    specials: Set<string> = new Set();
    quotes: Set<string> = new Set();
    colors: Theme = themes.default;
    tabValue: number = 2;


    private createSpan(text: string, type: keyof Theme) {
        const span = document.createElement("span");
        span.innerText = text;
        span.style.color = this.colors[type];
        return span
    }

    private isKeyword(word: string): keyof Theme | null {
        return (['keywords', 'specials'] as const).find(key => this[key].has(word)) ?? null
    }


    parse(text: string) {
        const result = [];
        let word = "";
        let quote = "";
        for (const char of text.split("")) {
            if (!!quote && char === quote) {
                const span = this.createSpan(word + char, "quotes");
                result.push(span.outerHTML);
                word = "";
                quote = "";
                continue
            }

            if (char === " ") {
                if (word) {
                    result.push(word);
                }
                result.push(char);
                word = "";
                continue;
            }
            const keyword = this.isKeyword(word + char)
            if (keyword) {
                const span = this.createSpan(word + char, keyword)
                word = "";
                result.push(span.outerHTML);
                continue;
            }
            if (this.openBrackets.has(char) || this.closeBrackets.has(char)) {
                result.push(word);
                const span = this.createSpan(char, "brackets");
                word = "";
                result.push(span.outerHTML);
                continue;
            }
            if (this.operators.has(char)) {
                result.push(word);
                const span = this.createSpan(char, "operators")
                word = "";
                result.push(span.outerHTML);
                continue;
            }
            if (this.quotes.has(char) && !quote) {
                quote = char;
                word += char;
                continue;
            }
            word += char;
        }

        if (word) {
            result.push(word);
        }

        return result;
    }



}

