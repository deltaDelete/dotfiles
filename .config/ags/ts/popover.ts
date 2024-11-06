import { register } from "resource:///com/github/Aylur/ags/widgets/widget.js";
import Gtk from "gi://Gtk?version=3.0";
import { BaseProps, Widget } from "types/widgets/widget";

type PopoverEventHandler<Self> = {
    on_closed?: (
        self: Self,
    ) => void | unknown;
};

export type PopoverProps<
    W extends Gtk.Widget = Gtk.Widget,
    Attr = unknown,
    Self = Popover<W, Attr>,
> = BaseProps<
    Self,
    Gtk.Popover.ConstructorProperties & {
        children?: W[];
    } & PopoverEventHandler<Self>,
    Attr
>;

export function newMenu<W extends Gtk.Widget = Gtk.Widget, Attr = unknown>(
    ...props: ConstructorParameters<typeof Popover<W, Attr>>
) {
    return new Popover(...props);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Popover<W, Attr> extends Widget<Attr> {}
export class Popover<W extends Gtk.Widget, Attr> extends Gtk.Popover {
    static {
        register(this, {
            properties: {
                children: ["jsobject", "rw"],
                "on-popup": ["jsobject", "rw"],
                "on-move-scroll": ["jsobject", "rw"],
            },
        });
    }

    constructor(props: PopoverProps<W, Attr> = {}, ...children: Gtk.Widget[]) {
        if (children.length > 0) props.children = children as W[];

        super(props as Gtk.Popover.ConstructorProperties);

        this.connect("closed", (_, ...args) => this.on_closed?.(this, ...args));
    }

    get on_closed() {
        return this._get("on-closed");
    }
    set on_closed(callback: PopoverEventHandler<this>["on_closed"]) {
        this._set("on-closed", callback);
    }

    get children() {
        return this.get_children() as W[];
    }
    set children(children: W[]) {
        this.get_children().forEach(ch => ch.destroy());

        if (!children) return;

        children.forEach(w => w && this.add(w));

        const visible = this.visible;
        this.show_all();
        this.visible = visible;
    }
}

export default Popover;
