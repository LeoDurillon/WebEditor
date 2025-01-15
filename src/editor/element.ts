type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <
    T
>() => T extends Y ? 1 : 2
    ? A
    : B;

type isFunction<T, P extends keyof T> = T[P] extends Function ? never : P;

type PropertyOf<T extends Object> = Partial<{
    [P in keyof T as IfEquals<
        { [Q in P]: T[P] },
        { -readonly [Q in P]: T[P] },
        P,
        never
    > extends never
    ? never
    : isFunction<T, P>]: T[P];
}>;

export default function createElement(
    element: keyof HTMLElementTagNameMap,
    data?: {
        id?: string;
        class?: string;
        style?: PropertyOf<HTMLElement["style"]>;
    },
    props?: Omit<PropertyOf<HTMLElement>, "style" | "className" | "id">
) {
    const res = document.createElement(element);
    if (data) {
        if (data.id) {
            res.id = data?.id ?? "";
        }
        if (data.class) {
            res.className = data?.class ?? "";
        }
        if (data.style) {
            Object.entries(data.style).forEach(([key, val]) => {
                res.style.setProperty(key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(), val ?? '');
            });
        }
    }

    if (props) {
        (Object.keys(props) as Array<keyof typeof props>).forEach((key) => {
            res.setAttribute(key, props[key]?.toString() ?? "");
        });
    }

    return res;
}
