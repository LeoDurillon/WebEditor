import Theme from '../themes/theme';
import themes from '../themes/themes';
import Language from './language';
export default class SQL extends Language {
    keywords: Set<string> = new Set([
        "WHERE",
        "SELECT",
        "ILIKE",
        "AND",
        "OR",
        "IN",
        "BETWEEN",
        "LIKE",
        "IS NULL",
        "NOT"
    ]);
    quotes: Set<string> = new Set("'");
    openBrackets: Set<string> = new Set(["("]);
    closeBrackets: Set<string> = new Set([")"]);
    operators: Set<string> = new Set(["<", ">", "=", "<>", "!=", ">=", "<="]);
    specials: Set<string> = new Set();
    colors: Theme;
    tabValue: number = 4;

    constructor(specials?: Set<string>, colors?: Theme) {
        super();
        this.specials = specials ?? this.specials;
        this.colors = colors ?? themes.default
    }

}

