import { exec, execAsync, lookUpIcon, monitorFile } from "resource:///com/github/Aylur/ags/utils.js";
import { Hyprland } from "./services";

export default function Language() {
    return Widget.Button({
        class_names: ["module", "hoverable", "language"],
        on_primary_click: _ => {
            execAsync(`hyprctl switchxkblayout all next`)
                .catch(s => console.log(s));
        },
        child: Widget.Label({
            label: "🇬🇧",
            setup: self => {
                Hyprland.connect("keyboard-layout", (_, keyboardname, layoutname) => {
                    self.label = layoutname == "Russian" ? "🇷🇺" : "🇬🇧";
                    self.tooltip_text = layoutname;
                });
            },
        }),
    });
}