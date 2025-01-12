import Theme from '../themes/theme';
import SQL from './sql';

export default function createLanguage(lang: "sql", options: { specials?: Iterable<string>, theme?: Theme }) {
    switch (lang) {

        case "sql": {
            return new SQL(options.specials, options.theme);
        }
    }
}
