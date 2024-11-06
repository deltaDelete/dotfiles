import Window from "types/widgets/window";
import Popover from "./popover";
import Gtk from "gi://Gtk?version=3.0";
import { Binding } from "resource:///com/github/Aylur/ags/service.js";

export function Popup(content) {
    return new Popover({
        class_name: "popover",
        child: content,
    });
}

type PopupAbsoluteProps = {
    content: Gtk.Widget,
    x: number,
    y: number
}

export function PopupAbsolute(
    /** @type {{content: Gtk.Widget, x: number, y: number}} */
    { content, x, y }: PopupAbsoluteProps,
): Window<Gtk.Widget, unknown> {
    return Widget.Window({
        popup: true,
        name: "popup-layer",
        class_name: "popup-util module",
        exclusivity: "normal",
        keymode: "on-demand",
        margins: [x, y],
        anchor: ["top", "left"],
        layer: "top",
        setup: self => {
            self.child = content;
        },
    });
}