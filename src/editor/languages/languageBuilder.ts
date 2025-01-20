import Theme from '../themes/theme';
import SQL from './sql';

export default function createLanguage(lang: "sql", options: { specials?: Array<string>, theme?: Theme }) {
    switch (lang) {

        case "sql": {
            return new SQL(new Set(options.specials), options.theme);
        }
    }
}
